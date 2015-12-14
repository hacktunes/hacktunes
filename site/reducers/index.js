import { combineReducers } from 'redux'
import metadata from './metadata'
import now from './now'
import player from './player'
import playerMetrics from './playerMetrics'

const rootReducer = combineReducers({
  now,
  metadata,
  player,
  playerMetrics,
})

export default rootReducer
