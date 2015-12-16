import Immutable from 'immutable'
import {
  SET_METADATA,
} from '../constants/actionTypes'

const StateRecord = Immutable.Record({
  current: null,
  songs: Immutable.Map(),
})

const SongRecord = Immutable.Record({
  title: 'Untitled Song',
  description: null,
  projectName: null,
  projectEnd: null,
  tracks: Immutable.Map(),
})

const AuthorRecord = Immutable.Record({
  name: null,
  email: null,
  url: null,
})

const TrackRecord = Immutable.Record({
  name: 'Untitled Track',
  version: '0.0.1',
  description: null,
  main: 'index.js',
  author: AuthorRecord(),
})

export default function metadata(state = StateRecord(), action) {
  switch (action.type) {
    case SET_METADATA:
      const metadata = Immutable.fromJS(action.metadata, (k, v) => {
        if (k === 'author') {
          return AuthorRecord(v)
        } else if (v.has('tracks')) {
          return SongRecord(v)
        } else if (v.has('main')) {
          return TrackRecord(v)
        }
        return v
      })
      return state.mergeDeep(metadata)

    default:
      return state
  }
}
