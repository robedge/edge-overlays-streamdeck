import streamDeck, { action, type KeyDownEvent, SingletonAction, type WillAppearEvent } from '@elgato/streamdeck'
import { edgeClient } from '../edge-client'
import { stateManager } from '../state-manager'

@action({ UUID: 'com.edgeoverlays.iracing.launch-vr' })
export class LaunchVRAction extends SingletonAction {
  override onWillAppear(ev: WillAppearEvent): void {
    this.updateVisual(ev)
    stateManager.onChange(() => this.updateAllVisuals())
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    const state = stateManager.getState()
    const isRunning = state?.vr.companionRunning ?? false

    const endpoint = isRunning ? '/api/sd/vr/stop' : '/api/sd/vr/launch'
    const result = await edgeClient.sendCommand(endpoint)

    if (result.success) {
      await ev.action.setState(isRunning ? 0 : 1)
    } else {
      await ev.action.showAlert()
    }
  }

  private updateVisual(ev: WillAppearEvent): void {
    const state = stateManager.getState()
    if ('setState' in ev.action) ev.action.setState(state?.vr.companionRunning ? 1 : 0)
  }

  private updateAllVisuals(): void {
    const state = stateManager.getState()
    const targetState = state?.vr.companionRunning ? 1 : 0
    for (const action of this.actions) {
      if ('setState' in action) action.setState(targetState)
    }
  }
}
