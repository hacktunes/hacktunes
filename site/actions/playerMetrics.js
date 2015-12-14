import * as types from '../constants/actionTypes'

export function playerUpdateFinish(duration) {
  return { type: types.PLAYER_UPDATE_FINISH, duration }
}

export function updateTrackLevels(trackKey, levels) {
  return { type: types.UPDATE_TRACK_LEVELS, trackKey, levels }
}
