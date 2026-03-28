import streamDeck, { action, type KeyDownEvent, type DidReceiveSettingsEvent, SingletonAction, type WillAppearEvent } from '@elgato/streamdeck'
import { edgeClient } from '../edge-client'
import { stateManager } from '../state-manager'
import { OVERLAY_TYPES } from '../types'

type Settings = {
  overlayType: string
}

@action({ UUID: 'com.edgeoverlays.iracing.toggle-overlay' })
export class ToggleOverlayAction extends SingletonAction<Settings> {
  override onWillAppear(ev: WillAppearEvent<Settings>): void {
    const { overlayType } = ev.payload.settings
    this.updateVisual(ev, overlayType)
    stateManager.onChange(() => this.updateAllVisuals())
  }

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): void {
    const { overlayType } = ev.payload.settings
    const label = OVERLAY_TYPES.find((o) => o.value === overlayType)?.label ?? overlayType
    ev.action.setTitle(label)
    const visible = stateManager.isOverlayVisible(overlayType)
    ev.action.setState(visible ? 1 : 0)
  }

  override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    const { overlayType } = ev.payload.settings
    if (!overlayType) {
      await ev.action.showAlert()
      return
    }

    const result = await edgeClient.sendCommand<{ visible: boolean }>('/api/sd/overlay/toggle', { overlayType })
    if (result.success && result.data) {
      await ev.action.setState(result.data.visible ? 1 : 0)
    } else {
      await ev.action.showAlert()
    }
  }

  private updateVisual(ev: WillAppearEvent<Settings>, overlayType: string): void {
    if (overlayType) {
      const label = OVERLAY_TYPES.find((o) => o.value === overlayType)?.label ?? overlayType
      ev.action.setTitle(label)
      const visible = stateManager.isOverlayVisible(overlayType)
      ev.action.setState(visible ? 1 : 0)
    }
  }

  private updateAllVisuals(): void {
    for (const action of this.actions) {
      action.getSettings().then((settings) => {
        if (settings.overlayType) {
          const visible = stateManager.isOverlayVisible(settings.overlayType)
          action.setState(visible ? 1 : 0)
        }
      })
    }
  }
}
