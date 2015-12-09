import { combineReducers } from 'redux'
import metadata from './metadata'
import player from './player'

const rootReducer = combineReducers({
  metadata,
  player,
})

export default rootReducer
