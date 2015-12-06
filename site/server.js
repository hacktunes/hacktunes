import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Page from './components/Page'
import App from './components/App'

function render(locals, callback) {
  const data = locals.data
  const appHTML = {__html: ReactDOMServer.renderToString(<App data={data} />)}
  const page = <Page title="hacktun.es" html={appHTML} initialData={data} scriptHash={locals.webpackStats.compilation.hash} />
  const pageHTML = ReactDOMServer.renderToStaticMarkup(page)
  callback(null, '<!DOCTYPE html>' + pageHTML)
}

export default render
