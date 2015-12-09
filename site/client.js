import React from 'react'
import ReactDOM from 'react-dom'
import { fetchSong } from './actions/player'

export default function client(store, view) {
  if (process.env.NODE_ENV !== 'production') {
    // we have to init this here manually (rather than the convenience of
    // webpack-dev-server --inline) because the hot reloading includes conflict
    // with the static page build (document not defined).
    require('webpack-dev-server/client?http://0.0.0.0:8080')
    require('webpack/hot/dev-server')
  }

  const ui = ReactDOM.render(view, document.getElementById('app'))

  store.dispatch(fetchSong(store.getState().metadata.current))

  window.hacktunes = { store, ui }
}
