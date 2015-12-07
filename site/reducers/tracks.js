import {
  TRACK_LOADED,
} from '../constants/ActionTypes'

export default function tracks(state = {}, action) {
  switch (action.type) {
    case TRACK_LOADED:
      const { songKey, trackKey } = action
      const newState = Object.assign({}, state)
      newState[songKey] = new Map(newState[songKey])
      newState[songKey].set(trackKey, action.track)
      return newState
    default:
      return state
  }
}
