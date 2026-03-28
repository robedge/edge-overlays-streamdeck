/**
 * Shared type definitions for the Edge Overlays Stream Deck plugin.
 * Mirrors overlay types and settings from the Edge Overlays app.
 */

export const PLUGIN_UUID = 'com.edgeoverlays.iracing'

/** Overlay types that can be toggled via Stream Deck */
export const OVERLAY_TYPES = [
  { value: 'racing-relative', label: 'Relative' },
  { value: 'racing-leaderboard', label: 'Leaderboard' },
  { value: 'racing-fuel', label: 'Fuel' },
  { value: 'racing-weather', label: 'Weather' },
  { value: 'racing-trackmap', label: 'Track Map' },
  { value: 'racing-flat-trackmap', label: 'Flat Track Map' },
  { value: 'racing-minimap', label: 'Mini Map' },
  { value: 'racing-radar', label: 'Radar' },
  { value: 'racing-input', label: 'Input' },
  { value: 'racing-telemetry', label: 'Telemetry' },
  { value: 'racing-battle-box', label: 'Battle Box' },
  { value: 'racing-spotter', label: 'Spotter' },
  { value: 'racing-incidents', label: 'Incidents' },
  { value: 'racing-overtake-alert', label: 'Overtake Alert' },
  { value: 'racing-pit-speed', label: 'Pit Speed' },
  { value: 'racing-data-frames', label: 'Data Frames' },
  { value: 'racing-twitch-chat', label: 'Twitch Chat' },
  { value: 'racing-turn-indicator', label: 'Turn Indicator' },
  { value: 'flags', label: 'Flags' },
  { value: 'incident-bar', label: 'Incident Bar' },
] as const

/** Boolean settings available per overlay type for toggling */
export const BOOLEAN_SETTINGS: Record<string, { value: string; label: string }[]> = {
  'racing-relative': [
    { value: 'showWeatherHeader', label: 'Weather Header' },
    { value: 'showHeader', label: 'Column Headers' },
    { value: 'showFooter', label: 'Session Footer' },
    { value: 'highlightIncidents', label: 'Highlight Incidents' },
    { value: 'showDriverTags', label: 'Show Driver Tags' },
    { value: 'hideCarsInPits', label: 'Hide in Pits' },
    { value: 'hideInGarage', label: 'Hide in Garage' },
    { value: 'hideOnTrack', label: 'Hide on Track' },
  ],
  'racing-leaderboard': [
    { value: 'showHeader', label: 'Session Header' },
    { value: 'highlightIncidents', label: 'Highlight Incidents' },
    { value: 'showDriverTags', label: 'Show Driver Tags' },
    { value: 'hideInGarage', label: 'Hide in Garage' },
    { value: 'hideOnTrack', label: 'Hide on Track' },
  ],
  'racing-weather': [
    { value: 'hideInGarage', label: 'Hide in Garage' },
    { value: 'hideOnTrack', label: 'Hide on Track' },
  ],
}

/** Numeric settings available per overlay type for increment/decrement */
export const NUMERIC_SETTINGS: Record<string, { value: string; label: string }[]> = {
  'racing-relative': [
    { value: 'carsAround', label: 'Cars Around' },
  ],
  'racing-leaderboard': [
    { value: 'driversAround', label: 'Cars Around' },
    { value: 'topCarsMyClass', label: 'Top Cars My Class' },
    { value: 'topCarsOtherClasses', label: 'Top Cars Other Classes' },
  ],
}

/** Visible fields available per overlay type */
export const VISIBLE_FIELDS: Record<string, { value: string; label: string }[]> = {
  'racing-relative': [
    { value: 'position', label: 'Position' },
    { value: 'positionChange', label: 'Position Change' },
    { value: 'gap', label: 'Gap' },
    { value: 'carNumber', label: 'Car Number' },
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'countryFlag', label: 'Country Flag' },
    { value: 'driverName', label: 'Driver Name' },
    { value: 'bestLap', label: 'Best Lap' },
    { value: 'lastLap', label: 'Last Lap' },
    { value: 'avgLap', label: 'Average Lap' },
    { value: 'stint', label: 'Stint' },
    { value: 'tireCompound', label: 'Tire Compound' },
    { value: 'safetyRating', label: 'Safety Rating' },
    { value: 'iRating', label: 'iRating' },
    { value: 'iRatingChange', label: 'iRating Change' },
    { value: 'pitLane', label: 'Pit Lane' },
    { value: 'pitStall', label: 'Pit Stall' },
    { value: 'flags', label: 'Flags' },
    { value: 'lastLapDelta', label: 'Last Lap Delta' },
    { value: 'bestLapDelta', label: 'Best Lap Delta' },
    { value: 'p2p', label: 'Push to Pass' },
  ],
  'racing-leaderboard': [
    { value: 'position', label: 'Position' },
    { value: 'positionChange', label: 'Position Change' },
    { value: 'carClass', label: 'Car Class' },
    { value: 'carNumber', label: 'Car Number' },
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'countryFlag', label: 'Country Flag' },
    { value: 'driverName', label: 'Driver Name' },
    { value: 'lastLap', label: 'Last Lap' },
    { value: 'bestLap', label: 'Best Lap' },
    { value: 'avgLap', label: 'Average Lap' },
    { value: 'safetyRating', label: 'Safety Rating' },
    { value: 'iRating', label: 'iRating' },
    { value: 'iRatingChange', label: 'iRating Change' },
    { value: 'gap', label: 'Gap' },
    { value: 'interval', label: 'Interval' },
    { value: 'flags', label: 'Flags' },
    { value: 'sessionInfo', label: 'Session Info' },
    { value: 'simTime', label: 'Sim Time' },
    { value: 'realTime', label: 'Real Time' },
    { value: 'lapNumber', label: 'Lap Number' },
    { value: 'stintLap', label: 'Stint Lap' },
    { value: 'prevStint', label: 'Previous Stint' },
    { value: 'lastPittedLap', label: 'Last Pitted Lap' },
    { value: 'tireCompound', label: 'Tire Compound' },
    { value: 'pitLane', label: 'Pit Lane' },
    { value: 'pitStall', label: 'Pit Stall' },
    { value: 'lastLapDelta', label: 'Last Lap Delta' },
    { value: 'bestLapDelta', label: 'Best Lap Delta' },
    { value: 'p2p', label: 'Push to Pass' },
  ],
  'racing-weather': [
    { value: 'trackTemp', label: 'Track Temp' },
    { value: 'airTemp', label: 'Air Temp' },
    { value: 'wind', label: 'Wind' },
    { value: 'precipitation', label: 'Precipitation' },
    { value: 'trackWetness', label: 'Track Wetness' },
  ],
}

/** Global settings (host/port for Edge Overlays connection) */
export type GlobalSettings = {
  host: string
  port: number
  [key: string]: string | number
}

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  host: 'localhost',
  port: 8855,
}

/** API response format from Edge Overlays */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/** WebSocket state update from Edge Overlays */
export interface StateUpdate {
  type: string
  data: unknown
}

/** Full state snapshot from Edge Overlays */
export interface FullState {
  connected: boolean
  locked: boolean
  allOverlaysVisible: boolean
  vr: { companionRunning: boolean }
  activeLayout: { id: string | null; name: string | null }
  overlays: OverlayState[]
}

export interface OverlayState {
  id: string
  type: string
  visible: boolean
  settings: Record<string, unknown>
}

export interface LayoutInfo {
  id: string
  name: string
}
