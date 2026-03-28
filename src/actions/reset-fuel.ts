import { action, type KeyDownEvent, SingletonAction } from '@elgato/streamdeck'
import { edgeClient } from '../edge-client'

@action({ UUID: 'com.edgeoverlays.iracing.reset-fuel' })
export class ResetFuelAction extends SingletonAction {
  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    const result = await edgeClient.sendCommand('/api/sd/fuel/reset')
    if (result.success) {
      await ev.action.showOk()
    } else {
      await ev.action.showAlert()
    }
  }
}
