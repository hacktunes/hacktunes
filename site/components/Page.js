import React from 'react'

export default function Page({title, html, initialData, scriptHash, cssName}) {
  const json = {__html: JSON.stringify(initialData)}

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <link rel="icon" href={require('../../static/favicon.png')} sizes="32x32" />
        {cssName && <link rel="stylesheet" type="text/css" id="css" href={'/' + cssName} />}
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={html} />
        <script src={'/main.' + scriptHash + '.js'} />
      </body>
    </html>
  )
}

Page.propTypes = {
  title: React.PropTypes.string.isRequired,
  html: React.PropTypes.object.isRequired,
  scriptHash: React.PropTypes.string.isRequired,
  cssName: React.PropTypes.string,
}
