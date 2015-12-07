import React from 'react'

//        <link rel="stylesheet" type="text/css" id="css" href="/static/main.css" />
export default function Page({title, html, initialData, scriptHash}) {
  const json = {__html: JSON.stringify(initialData)}

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <link rel="icon" href={require('../../static/favicon.png')} sizes="32x32" />
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
}
