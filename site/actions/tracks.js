import * as types from '../constants/actionTypes'

export function trackLoaded(songKey, trackKey, track) {
  return { type: types.TRACK_LOADED, songKey, trackKey, track }
}
