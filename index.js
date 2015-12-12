import React from 'react'
import { Provider } from 'react-redux'
import renderStaticPage from './site/server'
import configureStore from './site/store/configureStore'
import { setSong } from './site/actions/player'
import App from './site/containers/App'
import loadMetadata from './site/loadMetadata'
import loadTracks from './site/loadTracks'

const store = configureStore()

loadMetadata(store)
loadTracks(store)
store.dispatch(setSong(store.getState().metadata.current))

const view = (
  <Provider store={store}>
    <App />
  </Provider>
)

if (typeof document !== 'undefined') {
  require('style!./site/main.less')
  require('./site/client').default(store, view)
}

export default function renderPage(locals, callback) {
  require('./site/main.less')
  return renderStaticPage(store, view, locals, callback)
}
