import { trackLoaded } from './actions/tracks'

const seenModules = {}

function loadTracks(store) {
  const state = store.getState().tracks

  const trackRequire = require.context('../songs/', true, /index.js$/)
  trackRequire.keys().forEach(name => {
    const parts = name.split('/')
    const songKey = parts[1]
    const trackKey = parts[2]
    const trackModule = trackRequire(name)
    if (trackModule !== seenModules[name]) {
      seenModules[name] = trackModule
      Promise.all([trackModule.default()]).then(([track]) =>
        store.dispatch(trackLoaded(songKey, trackKey, track))
      )
    }
  })
  return trackRequire
}

export default function initTracks(store) {
  const trackRequire = loadTracks(store)

  if (module.hot) {
    module.hot.accept(trackRequire.id, () => {
      loadTracks(store)
    })
  }
}
