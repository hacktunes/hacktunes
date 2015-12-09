import Immutable from 'immutable'
import {
  SET_TRACK,
  LOAD_SONG_START,
  LOAD_TRACK_START,
  LOAD_RESOURCE_START,
  LOAD_RESOURCE_SUCCESS,
  LOAD_RESOURCE_FAILURE,
  START_PLAYBACK,
  PAUSE_PLAYBACK,
} from '../constants/actionTypes'
import {
  PLAYING,
  PAUSED,
  STOPPED,
} from '../constants/playbackStates'

const StateRecord = Immutable.Record({
  loading: false,
  state: STOPPED,
  startTime: null,
  tracks: Immutable.Map(),
  resources: Immutable.Map(),
})

const TrackRecord = Immutable.Record({
  loading: Immutable.Set(),
  module: null,
  resources: Immutable.Map(),
})

const ResourceRecord = Immutable.Record({
  type: null,
  data: null,
  loading: false,
  error: null
})

function track(state = TrackRecord(), action) {
  switch (action.type) {
    case SET_TRACK:
      return state.set('module', action.module)

    case LOAD_TRACK_START:
      const resources = Immutable.fromJS(action.resources)
      return state.merge({
        loading: resources.valueSeq().map(res => res.get('url')).toSet(),
        resources
      })
  }
}

export default function player(state = StateRecord(), action) {
  switch (action.type) {
    case LOAD_SONG_START:
      return state.set('loading', true)

    case SET_TRACK:
    case LOAD_TRACK_START:
      const { songKey, trackKey } = action
      return state.updateIn([ 'tracks', songKey, trackKey ], value => track(value, action))

    case LOAD_RESOURCE_START:
      return state.setIn([ 'resources', action.url ], ResourceRecord({
        loading: true,
        type: action.type,
      }))

    case LOAD_RESOURCE_SUCCESS:
      return state.withMutations(mutState => {
        mutState.mergeIn([ 'resources', action.url ], {
          loading: false,
          data: action.data,
        })

        let finished = true
        for (let [songKey, song] of state.tracks) {
          for (let [trackKey, track] of song) {
            if (track.loading.has(action.url)) {
              mutState.updateIn([ 'tracks', songKey, trackKey, 'loading' ], loading => loading.delete(action.url))
              if (!mutState.getIn([ 'tracks', songKey, trackKey, 'loading' ]).isEmpty()) {
                finished = false
              }
            }
          }
        }

        if (finished) {
          mutState.set('loading', false)
        }
      })

    case LOAD_RESOURCE_FAILURE:
      return state.mergeIn([ 'resources', action.url, 'error' ], {
        loading: false,
        error: action.error,
      })

    case START_PLAYBACK:
      return state.merge({
        state: PLAYING,
        startTime: performance.now(),
      })

    case PAUSE_PLAYBACK:
      return state.merge({
        state: PAUSED,
        pauseTime: performance.now(),
      })

    default:
      return state
  }
}
