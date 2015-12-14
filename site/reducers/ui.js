import {
  GRAB_SLIDER,
  RELEASE_SLIDER,
  MOVE_SEEK_SLIDER,
  RELEASE_SEEK_SLIDER,
} from '../constants/actionTypes'
import Immutable from 'immutable'

const StateRecord = Immutable.Record({
  grabbing: false,
  seekSliderDragTime: null,
})

export default function metadata(state = StateRecord(), action) {
  switch (action.type) {
    case GRAB_SLIDER:
      return state.set('grabbing', true)
    case RELEASE_SLIDER:
      return state.set('grabbing', false)
    case MOVE_SEEK_SLIDER:
      return state.set('seekSliderDragTime', action.seekTime)
    case RELEASE_SEEK_SLIDER:
      return state.delete('seekSliderDragTime')
    default:
      return state
  }
}
