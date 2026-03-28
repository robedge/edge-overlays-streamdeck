import { action, type KeyDownEvent, type DidReceiveSettingsEvent, SingletonAction, type WillAppearEvent } from '@elgato/streamdeck'
import { edgeClient } from '../edge-client'
import { NUMERIC_SETTINGS } from '../types'

type Settings = {
  overlayType: string
  setting: string
  direction: 'increment' | 'decrement'
  step: number
}

@action({ UUID: 'com.edgeoverlays.iracing.adjust-cars' })
export class AdjustCarsAction extends SingletonAction<Settings> {
  override onWillAppear(ev: WillAppearEvent<Settings>): void {
    this.updateTitle(ev)
  }

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): void {
    this.updateTitle(ev)
  }

  override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    const { overlayType, setting, direction = 'increment', step = 1 } = ev.payload.settings
    if (!overlayType || !setting) {
      await ev.action.showAlert()
      return
    }

    const endpoint = direction === 'decrement' ? '/api/sd/setting/decrement' : '/api/sd/setting/increment'
    const result = await edgeClient.sendCommand(endpoint, { overlayType, setting, step })

    if (result.success) {
      await ev.action.showOk()
    } else {
      await ev.action.showAlert()
    }
  }

  private updateTitle(ev: { payload: { settings: Settings }; action: { setTitle: (t: string) => Promise<void> } }): void {
    const { overlayType, setting, direction = 'increment' } = ev.payload.settings
    if (overlayType && setting) {
      const settingDef = NUMERIC_SETTINGS[overlayType]?.find((s) => s.value === setting)
      const arrow = direction === 'decrement' ? '-' : '+'
      ev.action.setTitle(`${arrow} ${settingDef?.label ?? setting}`)
    }
  }
}
