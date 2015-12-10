import { combineReducers } from 'redux'
import metadata from './metadata'
import now from './now'
import player from './player'

const rootReducer = combineReducers({
  now,
  metadata,
  player,
})

export default rootReducer
