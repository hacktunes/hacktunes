import React, { PropTypes } from 'react'

export default function Page({ title, html, scriptHash, cssName }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <link rel="icon" href={require('../static/favicon.png')} sizes="32x32" />
        {cssName && <link rel="stylesheet" type="text/css" id="css" href={cssName} />}
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={html} />
        <script src={'main.' + scriptHash + '.js'} />
      </body>
    </html>
  )
}

Page.propTypes = {
  title: PropTypes.string.isRequired,
  html: PropTypes.object.isRequired,
  scriptHash: PropTypes.string.isRequired,
  cssName: PropTypes.string,
}
