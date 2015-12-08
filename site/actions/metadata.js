import * as types from '../constants/actionTypes'

export function setMetadata(metadata) {
  return { type: types.SET_METADATA, metadata }
}
