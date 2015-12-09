import {
  setTrack,
} from './actions/player'

function _loadTracks(store) {
  const state = store.getState().player.tracks

  const trackRequire = require.context('../songs/', true, /index.js$/)
  trackRequire.keys().forEach(name => {
    const parts = name.split('/')
    const songKey = parts[1]
    const trackKey = parts[2]
    const trackModule = trackRequire(name)
    if (trackModule !== state.getIn([songKey, trackKey, 'module'])) {
      store.dispatch(setTrack(songKey, trackKey, trackModule))
      // FIXME: re-fetch?
    }
  })
  return trackRequire
}

export default function loadTracks(store) {
  const trackRequire = _loadTracks(store)

  if (module.hot) {
    module.hot.accept(trackRequire.id, () => {
      loadTracks(store)
    })
  }
}
