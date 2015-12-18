import Immutable from 'immutable'
import {
  INIT_AUDIO_CONTEXT,
  SET_SONG,
  SET_TRACK,
  LOAD_TRACK_START,
  LOAD_RESOURCE_START,
  LOAD_RESOURCE_SUCCESS,
  LOAD_RESOURCE_FAILURE,
  START_PLAYBACK,
  PAUSE_PLAYBACK,
  SEEK_PLAYBACK,
  PLAYBACK_FINISH,
} from '../constants/actionTypes'
import {
  PLAYING,
  PAUSED,
  STOPPED,
} from '../constants/playbackStates'

const StateRecord = Immutable.Record({
  ctx: null,
  song: null,
  loaded: false,
  state: STOPPED,
  startTime: null,
  pauseTime: 0,
  tracks: Immutable.Map(),
  resources: Immutable.Map(),
})

const TrackRecord = Immutable.Record({
  fetched: false,
  loading: Immutable.Set(),
  module: null,
  resources: Immutable.Map(),
})

const TrackResourceRecord = Immutable.Record({
  type: null,
  url: null,
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
      const resources = Immutable.fromJS(action.resources, (k, v) => k ? TrackResourceRecord(v) : v)
      return state.merge({
        fetched: true,
        loading: resources.valueSeq().map(res => res.get('url')).toSet(),
        resources
      })
  }
}

export default function player(state = StateRecord(), action) {
  switch (action.type) {
    case INIT_AUDIO_CONTEXT:
      return state.set('ctx', action.ctx)

    case SET_SONG:
      return state.merge({
        song: action.songKey,
        loaded: false,
      })

    case SET_TRACK:
    case LOAD_TRACK_START:
      const { songKey, trackKey } = action
      return state.updateIn([ 'tracks', songKey, trackKey ], value => track(value, action))

    case LOAD_RESOURCE_START:
      return state.setIn([ 'resources', action.url ], ResourceRecord({
        loading: true,
        type: action.resourceType,
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
          mutState.set('loaded', true)
          if (state.state === PLAYING && state.startTime === null) {
            mutState.set('startTime', performance.now())
          }
        }
      })

    case LOAD_RESOURCE_FAILURE:
      return state.mergeIn([ 'resources', action.url, 'error' ], {
        loading: false,
        error: action.error,
      })

    case START_PLAYBACK:
      let startTime
      if (!state.loaded) {
        startTime = null
      } else {
        startTime = performance.now()
      }

      if (state.state === PAUSED) {
        startTime -= state.pauseTime
      }

      return state.merge({
        state: PLAYING,
        startTime: startTime,
        pauseTime: null,
      })

    case PAUSE_PLAYBACK:
      return state.merge({
        state: PAUSED,
        startTime: null,
        pauseTime: state.pauseTime || performance.now() - state.startTime,
      })

    case SEEK_PLAYBACK:
      if (state.state === PAUSED) {
        return state.merge({
          pauseTime: action.seekTime,
        })
      } else {
        return state.merge({
          state: PLAYING,
          startTime: performance.now() - action.seekTime,
          pauseTime: null,
        })
      }

    case PLAYBACK_FINISH:
      return state.merge({
        state: STOPPED,
        startTime: null,
        pauseTime: null,
      })

    default:
      return state
  }
}
