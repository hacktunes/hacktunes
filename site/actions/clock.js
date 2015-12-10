import * as types from '../constants/actionTypes'

export function clockTick(now) {
  return { type: types.CLOCK_TICK, now }
}
