import * as types from '../constants/ActionTypes'

export function songsLoaded(songs) {
  return { type: types.SONGS_LOADED, songs }
}
