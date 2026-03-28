import streamDeck, { action, type KeyDownEvent, type DidReceiveSettingsEvent, SingletonAction, type WillAppearEvent } from '@elgato/streamdeck'
import { edgeClient } from '../edge-client'
import { stateManager } from '../state-manager'

type Settings = {
  layoutId: string
  layoutName: string
  [key: string]: string
}

@action({ UUID: 'com.edgeoverlays.iracing.activate-layout' })
export class ActivateLayoutAction extends SingletonAction<Settings> {
  override onWillAppear(ev: WillAppearEvent<Settings>): void {
    const { layoutName, layoutId } = ev.payload.settings
    if (layoutName) {
      ev.action.setTitle(layoutName)
    }
    if (layoutId && 'setState' in ev.action) {
      const isActive = stateManager.isLayoutActive(layoutId)
      ev.action.setState(isActive ? 1 : 0)
    }
    stateManager.onChange(() => this.updateAllVisuals())
  }

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): void {
    const { layoutName, layoutId } = ev.payload.settings
    if (layoutName) {
      ev.action.setTitle(layoutName)
    }
    if (layoutId && 'setState' in ev.action) {
      const isActive = stateManager.isLayoutActive(layoutId)
      ev.action.setState(isActive ? 1 : 0)
    }
  }

  override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    const { layoutId } = ev.payload.settings
    if (!layoutId) {
      await ev.action.showAlert()
      return
    }

    const result = await edgeClient.sendCommand('/api/sd/layout/activate', { layoutId })
    if (result.success) {
      await ev.action.setState(1)
    } else {
      await ev.action.showAlert()
    }
  }

  /** Handle requests from the Property Inspector for layout list */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async onSendToPlugin(ev: any): Promise<void> {
    const payload = ev.payload as Record<string, unknown>
    if (payload.command === 'getLayouts') {
      const layouts = await edgeClient.getLayouts()
      await ev.action.sendToPropertyInspector({
        event: 'layouts',
        layouts,
      })
    }
  }

  private updateAllVisuals(): void {
    for (const action of this.actions) {
      action.getSettings().then((settings) => {
        if (settings.layoutId && 'setState' in action) {
          const isActive = stateManager.isLayoutActive(settings.layoutId)
          action.setState(isActive ? 1 : 0)
        }
      })
    }
  }
}
