import * as types from '../constants/ActionTypes'

export function metadataLoaded(metadata) {
  return { type: types.METADATA_LOADED, metadata }
}
