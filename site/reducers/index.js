import { combineReducers } from 'redux'
import playback from './playback'
import metadata from './metadata'
import tracks from './tracks'

const rootReducer = combineReducers({
  playback,
  metadata,
  tracks,
})

export default rootReducer
