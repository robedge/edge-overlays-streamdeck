import streamDeck, { action, type KeyDownEvent, SingletonAction, type WillAppearEvent } from '@elgato/streamdeck'
import { edgeClient } from '../edge-client'
import { stateManager } from '../state-manager'

@action({ UUID: 'com.edgeoverlays.iracing.toggle-all' })
export class ToggleAllAction extends SingletonAction {
  override onWillAppear(ev: WillAppearEvent): void {
    this.updateVisual(ev)
    stateManager.onChange(() => this.updateAllVisuals())
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    const result = await edgeClient.sendCommand<{ visible: boolean }>('/api/sd/overlays/toggle-all')
    if (result.success && result.data) {
      await ev.action.setState(result.data.visible ? 1 : 0)
    } else {
      await ev.action.showAlert()
    }
  }

  private updateVisual(ev: WillAppearEvent): void {
    const state = stateManager.getState()
    if ('setState' in ev.action) ev.action.setState(state?.allOverlaysVisible ? 1 : 0)
  }

  private updateAllVisuals(): void {
    const state = stateManager.getState()
    const targetState = state?.allOverlaysVisible ? 1 : 0
    for (const action of this.actions) {
      if ('setState' in action) action.setState(targetState)
    }
  }
}
