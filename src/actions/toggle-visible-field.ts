import { action, type KeyDownEvent, type DidReceiveSettingsEvent, SingletonAction, type WillAppearEvent } from '@elgato/streamdeck'
import { edgeClient } from '../edge-client'
import { stateManager } from '../state-manager'
import { VISIBLE_FIELDS } from '../types'

type Settings = {
  overlayType: string
  field: string
}

@action({ UUID: 'com.edgeoverlays.iracing.toggle-visible-field' })
export class ToggleVisibleFieldAction extends SingletonAction<Settings> {
  override onWillAppear(ev: WillAppearEvent<Settings>): void {
    this.updateVisual(ev)
    stateManager.onChange(() => this.updateAllVisuals())
  }

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): void {
    this.updateTitle(ev)
  }

  override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    const { overlayType, field } = ev.payload.settings
    if (!overlayType || !field) {
      await ev.action.showAlert()
      return
    }

    const result = await edgeClient.sendCommand<{ field: string; visible: boolean }>('/api/sd/setting/visible-field', { overlayType, field })
    if (result.success && result.data) {
      await ev.action.setState(result.data.visible ? 1 : 0)
    } else {
      await ev.action.showAlert()
    }
  }

  private updateVisual(ev: WillAppearEvent<Settings>): void {
    this.updateTitle(ev)
    const { overlayType, field } = ev.payload.settings
    if (overlayType && field) {
      const settings = stateManager.getOverlaySettings(overlayType)
      const vf = settings?.visibleFields as Record<string, boolean> | undefined
      const value = vf?.[field] ?? false
      ev.action.setState(value ? 1 : 0)
    }
  }

  private updateTitle(ev: { payload: { settings: Settings }; action: { setTitle: (t: string) => Promise<void> } }): void {
    const { overlayType, field } = ev.payload.settings
    if (overlayType && field) {
      const fieldDef = VISIBLE_FIELDS[overlayType]?.find((f) => f.value === field)
      ev.action.setTitle(fieldDef?.label ?? field)
    }
  }

  private updateAllVisuals(): void {
    for (const action of this.actions) {
      action.getSettings().then((settings) => {
        if (settings.overlayType && settings.field) {
          const overlaySettings = stateManager.getOverlaySettings(settings.overlayType)
          const vf = overlaySettings?.visibleFields as Record<string, boolean> | undefined
          const value = vf?.[settings.field] ?? false
          action.setState(value ? 1 : 0)
        }
      })
    }
  }
}
