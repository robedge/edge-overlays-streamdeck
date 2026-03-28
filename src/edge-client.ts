import WebSocket from 'ws'
import streamDeck from '@elgato/streamdeck'
import type { ApiResponse, FullState, LayoutInfo, StateUpdate, GlobalSettings, DEFAULT_GLOBAL_SETTINGS } from './types'

type StateUpdateCallback = (update: StateUpdate) => void

/**
 * HTTP + WebSocket client for communicating with Edge Overlays.
 * Sends commands via REST, receives state updates via WebSocket.
 */
export class EdgeClient {
  private host = 'localhost'
  private port = 8855
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelay = 5000
  private maxReconnectDelay = 30000
  private stateCallbacks: StateUpdateCallback[] = []
  private _connected = false

  get connected(): boolean {
    return this._connected
  }

  get baseUrl(): string {
    return `http://${this.host}:${this.port}`
  }

  /**
   * Update connection settings from Stream Deck global settings
   */
  configure(settings: { host?: string; port?: number }): void {
    const hostChanged = settings.host !== undefined && settings.host !== this.host
    const portChanged = settings.port !== undefined && settings.port !== this.port

    if (settings.host !== undefined) this.host = settings.host
    if (settings.port !== undefined) this.port = settings.port

    if (hostChanged || portChanged) {
      streamDeck.logger.info(`[EdgeClient] Configured: ${this.host}:${this.port}`)
      this.disconnect()
      this.connect()
    }
  }

  /**
   * Subscribe to state updates from Edge Overlays
   */
  onStateUpdate(callback: StateUpdateCallback): void {
    this.stateCallbacks.push(callback)
  }

  /**
   * Send a POST command to Edge Overlays
   */
  async sendCommand<T = unknown>(endpoint: string, body?: object): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(5000),
      })
      return await response.json() as ApiResponse<T>
    } catch (error) {
      streamDeck.logger.error(`[EdgeClient] Command failed: ${endpoint}`, error)
      return { success: false, error: 'connection-failed' }
    }
  }

  /**
   * Send a GET query to Edge Overlays
   */
  async query<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        signal: AbortSignal.timeout(5000),
      })
      return await response.json() as ApiResponse<T>
    } catch (error) {
      streamDeck.logger.error(`[EdgeClient] Query failed: ${endpoint}`, error)
      return { success: false, error: 'connection-failed' }
    }
  }

  /**
   * Get full state snapshot
   */
  async getState(): Promise<FullState | null> {
    const result = await this.query<FullState>('/api/sd/state')
    return result.success ? (result.data ?? null) : null
  }

  /**
   * Get available layouts
   */
  async getLayouts(): Promise<LayoutInfo[]> {
    const result = await this.query<LayoutInfo[]>('/api/sd/layouts')
    return result.success ? (result.data ?? []) : []
  }

  /**
   * Connect WebSocket for state updates
   */
  connect(): void {
    if (this.ws) return

    try {
      const wsUrl = `ws://${this.host}:${this.port}/ws/streamdeck`
      streamDeck.logger.info(`[EdgeClient] Connecting to ${wsUrl}`)
      this.ws = new WebSocket(wsUrl)

      this.ws.on('open', () => {
        streamDeck.logger.info('[EdgeClient] WebSocket connected')
        this._connected = true
        this.reconnectDelay = 5000
      })

      this.ws.on('message', (data) => {
        try {
          const update = JSON.parse(data.toString()) as StateUpdate
          for (const cb of this.stateCallbacks) {
            cb(update)
          }
        } catch (error) {
          streamDeck.logger.error('[EdgeClient] Failed to parse message', error)
        }
      })

      this.ws.on('close', () => {
        streamDeck.logger.info('[EdgeClient] WebSocket disconnected')
        this._connected = false
        this.ws = null
        this.scheduleReconnect()
      })

      this.ws.on('error', (error) => {
        streamDeck.logger.error('[EdgeClient] WebSocket error', error)
        this._connected = false
        this.ws?.close()
        this.ws = null
        this.scheduleReconnect()
      })
    } catch (error) {
      streamDeck.logger.error('[EdgeClient] Failed to create WebSocket', error)
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this._connected = false
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    streamDeck.logger.info(`[EdgeClient] Reconnecting in ${this.reconnectDelay / 1000}s`)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, this.reconnectDelay)
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay)
  }
}

/** Singleton instance */
export const edgeClient = new EdgeClient()
