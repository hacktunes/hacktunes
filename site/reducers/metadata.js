import Immutable from 'immutable'
import {
  SET_METADATA,
} from '../constants/actionTypes'

const StateRecord = Immutable.Record({
  current: null,
  songs: Immutable.Map(),
})

export default function metadata(state = StateRecord(), action) {
  switch (action.type) {
    case SET_METADATA:
      return state.mergeDeep(action.metadata)
    default:
      return state
  }
}
