import {
  SONGS_LOADED,
} from '../constants/ActionTypes'

export default function song(state = {}, action) {
  switch (action.type) {
    case SONGS_LOADED:
      return action.songs
    default:
      return state
  }
}
