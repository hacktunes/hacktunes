import React from 'react'
import { Provider } from 'react-redux'
import renderStaticPage from './site/server'
import configureStore from './site/store/configureStore'
import App from './site/containers/App'

const store = configureStore()

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
