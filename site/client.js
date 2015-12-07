import React from 'react'
import ReactDOM from 'react-dom'
import Player from './Player'


export default function client(store, view) {
  if (process.env.NODE_ENV !== 'production') {
    // we have to init this here manually (rather than the convenience of
    // webpack-dev-server --inline) because the hot reloading includes conflict
    // with the static page build (document not defined).
    require('webpack-dev-server/client?http://0.0.0.0:8080')
    require('webpack/hot/dev-server')
  }

  ReactDOM.render(view, document.getElementById('app'))

  fetch(require('../songs/still-alive/still-alive.mid'))
    .then(response => response.arrayBuffer())
    .then(buffer => {
      let player = new Player(buffer)

      function updatePlayer() {
        const state = store.getState()
        player.setTracks(state.tracks.get(state.metadata.current))
      }

      store.subscribe(updatePlayer)
      updatePlayer()
      player.play()
    })
}
