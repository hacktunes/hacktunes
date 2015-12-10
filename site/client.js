import React from 'react'
import ReactDOM from 'react-dom'
import { clockTick } from './actions/clock'
import * as playerActions from './actions/player'
import * as metadataActions from './actions/metadata'
import { bindActionCreators } from 'redux'
import Player from './lib/Player'
import { fetchAndStartPlayback } from './actions/player'

export default function client(store, view) {
  if (process.env.NODE_ENV !== 'production') {
    // we have to init this here manually (rather than the convenience of
    // webpack-dev-server --inline) because the hot reloading includes conflict
    // with the static page build (document not defined).
    require('webpack-dev-server/client?http://0.0.0.0:8080')
    require('webpack/hot/dev-server')
  }

  const ui = ReactDOM.render(view, document.getElementById('app'))

  const currentSong = store.getState().metadata.current
  store.dispatch(fetchAndStartPlayback(currentSong))

  const player = new Player()
  let lastPlayerState
  function updatePlayer() {
    const newState = store.getState().player
    if (newState !== lastPlayerState) {
      player.update(newState)
      lastPlayerState = newState
    }
  }
  store.subscribe(updatePlayer)
  updatePlayer()

  setInterval(() => store.dispatch(clockTick(performance.now())), 1000 / 20)

  window.hacktunes = {
    store,
    ui,
    player,
    metadataActions: bindActionCreators(playerActions, store.dispatch),
    playerActions: bindActionCreators(metadataActions, store.dispatch),
  }
}
