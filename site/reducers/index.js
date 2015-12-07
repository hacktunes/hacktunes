import { combineReducers } from 'redux'
import playback from './playback'
import songs from './songs'

const rootReducer = combineReducers({
  playback,
  songs,
})

export default rootReducer
