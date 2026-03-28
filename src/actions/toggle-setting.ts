import { action, type KeyDownEvent, type DidReceiveSettingsEvent, SingletonAction, type WillAppearEvent } from '@elgato/streamdeck'
import { edgeClient } from '../edge-client'
import { stateManager } from '../state-manager'
import { BOOLEAN_SETTINGS } from '../types'

type Settings = {
  overlayType: string
  setting: string
}

@action({ UUID: 'com.edgeoverlays.iracing.toggle-setting' })
export class ToggleSettingAction extends SingletonAction<Settings> {
  override onWillAppear(ev: WillAppearEvent<Settings>): void {
    this.updateVisual(ev)
    stateManager.onChange(() => this.updateAllVisuals())
  }

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): void {
    this.updateTitle(ev)
  }

  override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    const { overlayType, setting } = ev.payload.settings
    if (!overlayType || !setting) {
      await ev.action.showAlert()
      return
    }

    const result = await edgeClient.sendCommand<{ setting: string; value: boolean }>('/api/sd/setting/toggle', { overlayType, setting })
    if (result.success && result.data) {
      await ev.action.setState(result.data.value ? 1 : 0)
    } else {
      await ev.action.showAlert()
    }
  }

  private updateVisual(ev: WillAppearEvent<Settings>): void {
    this.updateTitle(ev)
    const { overlayType, setting } = ev.payload.settings
    if (overlayType && setting) {
      const settings = stateManager.getOverlaySettings(overlayType)
      const value = settings?.[setting] ?? false
      ev.action.setState(value ? 1 : 0)
    }
  }

  private updateTitle(ev: { payload: { settings: Settings }; action: { setTitle: (t: string) => Promise<void> } }): void {
    const { overlayType, setting } = ev.payload.settings
    if (overlayType && setting) {
      const settingDef = BOOLEAN_SETTINGS[overlayType]?.find((s) => s.value === setting)
      ev.action.setTitle(settingDef?.label ?? setting)
    }
  }

  private updateAllVisuals(): void {
    for (const action of this.actions) {
      action.getSettings().then((settings) => {
        if (settings.overlayType && settings.setting) {
          const overlaySettings = stateManager.getOverlaySettings(settings.overlayType)
          const value = overlaySettings?.[settings.setting] ?? false
          action.setState(value ? 1 : 0)
        }
      })
    }
  }
}
