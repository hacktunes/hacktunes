import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Page from './components/Page'

function renderStaticPage(store, view, locals, callback) {
  const appHTML = {__html: ReactDOMServer.renderToString(view)}
  const page = <Page title="hacktun.es" html={appHTML} scriptHash={locals.webpackStats.compilation.hash} />
  const pageHTML = ReactDOMServer.renderToStaticMarkup(page)
  callback(null, '<!DOCTYPE html>' + pageHTML)
}

export default renderStaticPage
