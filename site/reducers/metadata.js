import {
  METADATA_LOADED,
} from '../constants/ActionTypes'

export default function metadata(state = {}, action) {
  switch (action.type) {
    case METADATA_LOADED:
      return Object.assign({}, action.metadata)
    default:
      return state
  }
}
