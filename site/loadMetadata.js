import { setMetadata } from './actions/metadata'

function _loadMetadata(store) {
  const songRequire = require.context('../songs/', true, /(info|song|package)\.json$/)
  const metaData = songRequire('./info.json')
  metaData.songs = {}
  songRequire.keys().forEach(name => {
    const parts = name.split('/')
    const filename = parts[parts.length - 1]
    if (filename === 'info.json') {
      return
    }

    const songKey = parts[1]
    metaData.songs[songKey] = metaData.songs[songKey] || {}

    if (filename === 'song.json') {
      Object.assign(metaData.songs[songKey], songRequire(name))
    } else if (filename === 'package.json') {
      const trackKey = parts[2]
      metaData.songs[songKey].tracks = metaData.songs[songKey].tracks || {}
      metaData.songs[songKey].tracks[trackKey] = songRequire(name)
    }
  })
  store.dispatch(setMetadata(metaData))
  return songRequire
}

export default function loadMetadata(store) {
  const songRequire = _loadMetadata(store)

  if (module.hot) {
    module.hot.accept(songRequire.id, () => {
      loadMetadata(store)
    })
  }
}
