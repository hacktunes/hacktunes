import * as types from '../constants/actionTypes'

export function metadataLoaded(metadata) {
  return { type: types.METADATA_LOADED, metadata }
}
