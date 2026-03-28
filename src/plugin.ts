import streamDeck from '@elgato/streamdeck'
import { edgeClient } from './edge-client'
import { stateManager } from './state-manager'
import type { GlobalSettings } from './types'
import { DEFAULT_GLOBAL_SETTINGS } from './types'

// Import all action classes
import { ToggleOverlayAction } from './actions/toggle-overlay'
import { ToggleAllAction } from './actions/toggle-all'
import { ActivateLayoutAction } from './actions/activate-layout'
import { LaunchVRAction } from './actions/launch-vr'
import { ResetFuelAction } from './actions/reset-fuel'
import { ToggleLockAction } from './actions/toggle-lock'
import { ToggleSettingAction } from './actions/toggle-setting'
import { AdjustCarsAction } from './actions/adjust-cars'
import { ToggleVisibleFieldAction } from './actions/toggle-visible-field'

// Register all actions
streamDeck.actions.registerAction(new ToggleOverlayAction())
streamDeck.actions.registerAction(new ToggleAllAction())
streamDeck.actions.registerAction(new ActivateLayoutAction())
streamDeck.actions.registerAction(new LaunchVRAction())
streamDeck.actions.registerAction(new ResetFuelAction())
streamDeck.actions.registerAction(new ToggleLockAction())
streamDeck.actions.registerAction(new ToggleSettingAction())
streamDeck.actions.registerAction(new AdjustCarsAction())
streamDeck.actions.registerAction(new ToggleVisibleFieldAction())

// Load global settings and configure EdgeClient
streamDeck.settings.getGlobalSettings<GlobalSettings>().then((settings) => {
  const host = settings.host || DEFAULT_GLOBAL_SETTINGS.host
  const port = settings.port || DEFAULT_GLOBAL_SETTINGS.port
  edgeClient.configure({ host, port })
  edgeClient.connect()
})

// Listen for global settings changes (from Property Inspector)
streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((ev) => {
  const host = ev.settings.host || DEFAULT_GLOBAL_SETTINGS.host
  const port = ev.settings.port || DEFAULT_GLOBAL_SETTINGS.port
  edgeClient.configure({ host, port })
})

// Handle system wake — reconnect
streamDeck.system.onSystemDidWakeUp(() => {
  streamDeck.logger.info('[Plugin] System woke up, reconnecting...')
  edgeClient.disconnect()
  edgeClient.connect()
})

// Connect to Stream Deck
streamDeck.connect()
