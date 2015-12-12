import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Page from './components/Page'

function renderStaticPage(store, view, locals, callback) {
  // Grab hashed CSS name out of compiled object.
  // FIXME: is there an easier way to do this, or can we contribute one upstream?
  const cssName = locals.webpackStats.compilation.namedChunks.main.files.find(name => /\.css$/.test(name))
  const appHTML = {__html: ReactDOMServer.renderToString(view)}
  const page = <Page
    title="hacktun.es"
    html={appHTML}
    scriptHash={locals.webpackStats.compilation.hash}
    cssName={cssName}
  />
  const pageHTML = ReactDOMServer.renderToStaticMarkup(page)
  callback(null, '<!DOCTYPE html>' + pageHTML)
}

export default renderStaticPage
