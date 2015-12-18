import * as types from '../constants/actionTypes'
import { AUDIO, MIDI } from '../constants/resourceTypes'

export function initAudioContext(ctx) {
  return { type: types.INIT_AUDIO_CONTEXT, ctx }
}

export function setSong(songKey) {
  return { type: types.SET_SONG, songKey }
}

export function setTrack(songKey, trackKey, module) {
  return { type: types.SET_TRACK, songKey, trackKey, module }
}

export function loadTrack(songKey, trackKey, module) {
  return (dispatch, getState) => {
    const state = getState().player
    if (module === state.getIn([songKey, trackKey, 'module'])) {
      return
    }
    dispatch(setTrack(songKey, trackKey, module))
    if (state.song === songKey && state.loaded) {
      dispatch(fetchTrack(songKey, trackKey))
    }
  }
}

export function fetchSong() {
  return (dispatch, getState) => {
    const state = getState().player
    const songKey = state.song
    const tracks = state.tracks.get(songKey)
    for (let trackKey of tracks.keys()) {
      dispatch(fetchTrack(songKey, trackKey))
    }
  }
}

function decodeAudioData(ctx, buffer) {
  // wrap the callback API in a promise
  return new Promise((resolve, reject) =>
    ctx.decodeAudioData(buffer, resolve, reject))
}

export function fetchTrack(songKey, trackKey) {
  return (dispatch, getState) => {
    const state = getState().player
    const track = state.tracks.getIn([ songKey, trackKey ])
    const env = {
      loadAudio(url) {
        dispatch(fetchResource(url, AUDIO, buffer => decodeAudioData(state.ctx, buffer)))
        return { url, type: AUDIO }
      },

      loadMIDI(url) {
        dispatch(fetchResource(url, MIDI))
        return { url, type: MIDI }
      },
    }
    const resources = track.module.load(env)
    dispatch(loadTrackStart(songKey, trackKey, resources))
  }
}

export function loadTrackStart(songKey, trackKey, resources) {
  return { type: types.LOAD_TRACK_START, songKey, trackKey, resources }
}

function fetchResource(url, resourceType, converter) {
  return (dispatch, getState) => {
    if (getState().player.resources.getIn([ url, 'loading' ])) {
      return
    }
    dispatch(loadResourceStart(url, resourceType))
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(converter)
        .then(result => dispatch(loadResourceSuccess(url, result)))
        .catch(err => dispatch(loadResourceFailure(url, err)))
  }
}

export function loadResourceStart(url, resourceType) {
  return { type: types.LOAD_RESOURCE_START, url, resourceType }
}

export function loadResourceSuccess(url, data) {
  return { type: types.LOAD_RESOURCE_SUCCESS, url, data }
}

export function loadResourceFailure(url, error) {
  return { type: types.LOAD_RESOURCE_SUCCESS, url, error }
}

export function enableTrack(songKey, trackKey) {
  return { type: types.ENABLE_TRACK, songKey, trackKey }
}

export function disableTrack(songKey, trackKey) {
  return { type: types.DISABLE_TRACK, songKey, trackKey }
}

export function toggleTrack(songKey, trackKey) {
  return (dispatch, getState) => {
    const track = getState().player.tracks.getIn([ songKey, trackKey ])
    const action = track.enabled ? disableTrack : enableTrack
    dispatch(action(songKey, trackKey))
  }
}

export function startPlayback() {
  return { type: types.START_PLAYBACK }
}

export function fetchAndStartPlayback() {
  return (dispatch, getState) => {
    const state = getState().player
    if (!state.loaded) {
      dispatch(fetchSong())
    }
    dispatch(startPlayback())
  }
}

export function pausePlayback() {
  return { type: types.PAUSE_PLAYBACK }
}

export function seekPlayback(seekTime) {
  return { type: types.SEEK_PLAYBACK, seekTime }
}
