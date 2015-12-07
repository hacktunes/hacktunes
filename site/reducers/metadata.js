import Immutable from 'immutable'
import {
  METADATA_LOADED,
} from '../constants/ActionTypes'

const StateRecord = Immutable.Record({
  current: null,
  songs: Immutable.Map(),
})

export default function metadata(state = StateRecord(), action) {
  switch (action.type) {
    case METADATA_LOADED:
      return StateRecord(action.metadata)
    default:
      return state
  }
}
