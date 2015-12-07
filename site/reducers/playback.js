import Immutable from 'immutable'
import {
  START_PLAYBACK,
  PAUSE_PLAYBACK,
} from '../constants/ActionTypes'

const StateRecord = Immutable.Record({
  startTime: null,
  pauseTime: null,
})

export default function playback(state = StateRecord(), action) {
  switch (action.type) {
    case START_PLAYBACK:
      return state.set('startTime', performance.now())
    case PAUSE_PLAYBACK:
      return state.set('pauseTime', performance.now())
    default:
      return state
  }
}
