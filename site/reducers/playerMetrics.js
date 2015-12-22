import {
  PLAYER_UPDATE_FINISH,
  UPDATE_TRACK_LEVELS,
} from '../constants/actionTypes'
import Immutable from 'immutable'

const MetricsRecord = Immutable.Record({
  songDuration: 0,
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

export default function metadata(state = MetricsRecord(), action) {
  switch (action.type) {
    case PLAYER_UPDATE_FINISH:
      return MetricsRecord({ songDuration: action.duration })

    case UPDATE_TRACK_LEVELS:
      return state.setIn(['trackLevels', action.trackKey], LevelsRecord(action.levels))

    default:
      return state
  }
}
