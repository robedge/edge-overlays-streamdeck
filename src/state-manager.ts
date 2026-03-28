import streamDeck from '@elgato/streamdeck'
import { edgeClient } from './edge-client'
import type { FullState, StateUpdate, OverlayState } from './types'

/**
 * Maintains a local mirror of Edge Overlays state.
 * Updates Stream Deck button visuals when state changes.
 */
class StateManager {
  private state: FullState | null = null

  constructor() {
    edgeClient.onStateUpdate((update) => this.handleUpdate(update))
  }

  /** Get current state */
  getState(): FullState | null {
    return this.state
  }

  /** Check if a specific overlay type is visible */
  isOverlayVisible(overlayType: string): boolean {
    if (!this.state) return false
    const overlay = this.state.overlays.find((o) => o.type === overlayType)
    return overlay?.visible ?? false
  }

  /** Get an overlay's settings */
  getOverlaySettings(overlayType: string): Record<string, unknown> | null {
    if (!this.state) return null
    const overlay = this.state.overlays.find((o) => o.type === overlayType)
    return overlay?.settings ?? null
  }

  /** Check if a specific layout is active */
  isLayoutActive(layoutId: string): boolean {
    return this.state?.activeLayout.id === layoutId
  }

  /** Handle a state update from WebSocket */
  private handleUpdate(update: StateUpdate): void {
    if (update.type === 'full-state') {
      this.state = update.data as FullState
      this.refreshAllButtons()
      return
    }

    if (!this.state) return

    const data = update.data as Record<string, unknown>

    switch (update.type) {
      case 'overlay-visibility-changed': {
        const overlayType = data.overlayType as string
        if (overlayType === '*') {
          this.state.allOverlaysVisible = data.visible as boolean
        } else {
          const overlay = this.state.overlays.find((o) => o.type === overlayType)
          if (overlay) overlay.visible = data.visible as boolean
        }
        break
      }
      case 'setting-changed': {
        const overlayType = data.overlayType as string
        const setting = data.setting as string
        const value = data.value
        const overlay = this.state.overlays.find((o) => o.type === overlayType)
        if (overlay) {
          if (setting.startsWith('visibleField.')) {
            const field = setting.replace('visibleField.', '')
            const vf = overlay.settings.visibleFields as Record<string, boolean> | undefined
            if (vf) vf[field] = value as boolean
          } else {
            overlay.settings[setting] = value
          }
        }
        break
      }
      case 'layout-changed':
        this.state.activeLayout = {
          id: data.layoutId as string | null,
          name: data.layoutName as string | null,
        }
        break
      case 'vr-status-changed':
        this.state.vr.companionRunning = data.running as boolean
        break
      case 'lock-changed':
        this.state.locked = data.locked as boolean
        break
    }

    this.refreshAllButtons()
  }

  /** Refresh all visible Stream Deck buttons to match current state */
  private refreshAllButtons(): void {
    streamDeck.actions.forEach((action) => {
      // Each action's onWillAppear handler reads state from the manager
      // Trigger a visual refresh by emitting a custom event
      // Actions subscribe to state changes via their own logic
    })
    // The actual refresh is handled by each action class listening to state changes
    // We emit a generic event that action classes can subscribe to
    for (const cb of this.changeCallbacks) {
      cb()
    }
  }

  private changeCallbacks: (() => void)[] = []

  /** Subscribe to state change events (used by action classes to refresh visuals) */
  onChange(callback: () => void): void {
    this.changeCallbacks.push(callback)
  }
}

export const stateManager = new StateManager()
