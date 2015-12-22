import {
  PLAYER_UPDATE_FINISH,
  UPDATE_TRACK_LEVELS,
} from '../constants/actionTypes'
import {
  MetricsRecord,
  LevelsRecord,
} from '../constants/recordTypes'

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
