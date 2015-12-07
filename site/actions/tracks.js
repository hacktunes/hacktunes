import * as types from '../constants/ActionTypes'

export function trackLoaded(songKey, trackKey, track) {
  return { type: types.TRACK_LOADED, songKey, trackKey, track }
}
