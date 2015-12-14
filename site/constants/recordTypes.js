import Immutable from 'immutable'

export const MetricsRecord = Immutable.Record({
  songDuration: null,
  trackLevels: Immutable.Map(),
})

export const LevelsRecord = Immutable.Record({
  leftAvg: 0,
  leftMax: 0,
  leftClip: false,
  rightAvg: 0,
  rightMax: 0,
  rightClip: false,
})
