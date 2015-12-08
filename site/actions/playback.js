import * as types from '../constants/actionTypes'

export function startPlayback() {
  return { type: types.START_PLAYBACK }
}

export function pausePlayback() {
  return { type: types.PAUSE_PLAYBACK }
}
