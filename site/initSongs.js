import { songsLoaded } from './actions/songs'

function loadSongs(store) {
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
      metaData.songs[songKey].info = songRequire(name)
    } else if (filename === 'package.json') {
      const trackKey = parts[2]
      metaData.songs[songKey].tracks = metaData.songs[songKey].tracks || {}
      metaData.songs[songKey].tracks[trackKey] = songRequire(name)
    }
  })
  store.dispatch(songsLoaded(metaData))
  return songRequire
}

export default function initSongs(store) {
  const songRequire = loadSongs(store)

  if (module.hot) {
    module.hot.accept(songRequire.id, () => {
      loadSongs(store)
    })
  }
}
