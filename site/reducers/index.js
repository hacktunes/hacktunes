import { combineReducers } from 'redux'
import metadata from './metadata'
import now from './now'
import player from './player'
import playerMetrics from './playerMetrics'
import ui from './ui'

const rootReducer = combineReducers({
  now,
  metadata,
  player,
  playerMetrics,
  ui,
})

export default rootReducer
