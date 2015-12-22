import * as types from '../constants/actionTypes'
import {
  fetchAndStartPlayback,
  pausePlayback,
  seekPlayback,
  toggleTrack,
} from './player'

export function grabSlider() {
  return { type: types.GRAB_SLIDER }
}

export function releaseSlider() {
  return { type: types.RELEASE_SLIDER }
}

export function moveSeekSlider(seekTime) {
  return { type: types.MOVE_SEEK_SLIDER, seekTime }
}

export function releaseSeekSlider(seekTime) {
  return dispatch => {
    dispatch(seekPlayback(seekTime))
    dispatch(releaseSlider())
    dispatch({ type: types.RELEASE_SEEK_SLIDER, seekTime })
  }
}

export { fetchAndStartPlayback, pausePlayback, toggleTrack }
