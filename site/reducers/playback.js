import {
  START_PLAYBACK,
  PAUSE_PLAYBACK,
} from '../constants/ActionTypes'

const initialState = {
  startTime: null,
  pauseTime: null,
}

export default function playback(state = initialState, action) {
  switch (action.type) {
    case START_PLAYBACK:
      return Object.assign({}, state, {
        startTime: performance.now(),
      })
    case PAUSE_PLAYBACK:
      return Object.assign({}, state, {
        pauseTime: performance.now(),
      })
    default:
      return state
  }
}
