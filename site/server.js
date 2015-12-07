import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Page from './components/Page'
import App from './components/App'

function render(locals, callback) {
  const appHTML = {__html: ReactDOMServer.renderToString(<App />)}
  const page = <Page title="hacktun.es" html={appHTML} scriptHash={locals.webpackStats.compilation.hash} />
  const pageHTML = ReactDOMServer.renderToStaticMarkup(page)
  callback(null, '<!DOCTYPE html>' + pageHTML)
}

export default render
