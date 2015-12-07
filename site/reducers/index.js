import { combineReducers } from 'redux'
import playback from './playback'
import songs from './songs'
import tracks from './tracks'

const rootReducer = combineReducers({
  playback,
  songs,
  tracks,
})

export default rootReducer
