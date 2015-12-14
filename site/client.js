import React from 'react'
import ReactDOM from 'react-dom'
import { clockTick } from './actions/clock'
import * as playerActions from './actions/player'
import * as playerMetricsActions from './actions/playerMetrics'
import * as metadataActions from './actions/metadata'
import { bindActionCreators } from 'redux'
import Player from './lib/Player'

export default function client(store, view) {
  if (process.env.NODE_ENV !== 'production') {
    // we have to init this here manually (rather than the convenience of
    // webpack-dev-server --inline) because the hot reloading includes conflict
    // with the static page build (document not defined).
    require('webpack-dev-server/client?http://0.0.0.0:8080')
    require('webpack/hot/dev-server')
  }

  const ui = ReactDOM.render(view, document.getElementById('app'))

  const player = new Player(bindActionCreators(playerMetricsActions, store.dispatch))
  let lastPlayerState
  function updatePlayer() {
    const newState = store.getState().player
    if (newState !== lastPlayerState) {
      lastPlayerState = newState
      player.update(newState)
    }
  }
  store.subscribe(updatePlayer)
  updatePlayer()

  setInterval(() => store.dispatch(clockTick(performance.now())), 1000 / 20)

  window.H = {
    store,
    ui,
    player,
    metadataActions: bindActionCreators(playerActions, store.dispatch),
    playerActions: bindActionCreators(metadataActions, store.dispatch),
  }
}
