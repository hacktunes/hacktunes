import React from 'react'
import { Provider } from 'react-redux'
import renderStaticPage from './site/server'
import configureStore from './site/store/configureStore'
import App from './site/containers/App'
import initSongs from './site/initSongs'

const store = configureStore()

initSongs(store)

const view = (
  <Provider store={store}>
    <App />
  </Provider>
)

if (typeof document !== 'undefined') {
  require('./site/client').default(store, view)
}

export default function renderPage(locals, callback) {
  return renderStaticPage(store, view, locals, callback)
}
