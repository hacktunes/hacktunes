import * as types from '../constants/actionTypes'
import { MIDI } from '../constants/resourceTypes'

export function setSong(songKey) {
  return { type: types.SET_SONG, songKey }
}

export function setAllTracksStart() {
  return { type: types.SET_ALL_TRACKS_START }
}

export function setTrack(songKey, trackKey, module) {
  return { type: types.SET_TRACK, songKey, trackKey, module }
}

export function loadTrack(songKey, trackKey, module) {
  return (dispatch, getState) => {
    dispatch(setTrack(songKey, trackKey, module))
    const state = getState().player
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

export function fetchTrack(songKey, trackKey) {
  return (dispatch, getState) => {
    const track = getState().player.tracks.getIn([ songKey, trackKey ])
    const env = {
      loadMIDI(url) {
        dispatch(fetchMIDI(url))
        return { type: MIDI, url }
      }
    }
    const resources = track.module.load(env)
    dispatch(loadTrackStart(songKey, trackKey, resources))
  }
}

export function loadTrackStart(songKey, trackKey, resources) {
  return { type: types.LOAD_TRACK_START, songKey, trackKey, resources }
}

export function fetchMIDI(url) {
  return (dispatch, getState) => {
    if (getState().player.resources.getIn([ url, 'loading' ])) {
      return
    }
    dispatch(loadResourceStart(url, MIDI))
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(buffer => dispatch(loadResourceSuccess(url, buffer)))
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
