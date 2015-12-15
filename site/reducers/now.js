import {
  CLOCK_TICK,
} from '../constants/actionTypes'

export default function metadata(state = 0, action) {
  switch (action.type) {
    case CLOCK_TICK:
      return action.now

    default:
      return state
  }
}
