import Immutable from 'immutable'
import {
  TRACK_LOADED,
} from '../constants/ActionTypes'

export default function tracks(state = Immutable.Map(), action) {
  switch (action.type) {
    case TRACK_LOADED:
      const { songKey, trackKey } = action
      return state.setIn([songKey, trackKey], action.track)
    default:
      return state
  }
}
