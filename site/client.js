import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import Player from './Player'

const metaData = require('../meta/data.json')

export default function client() {
  ReactDOM.render(<App />, document.getElementById('app'))

  const tracks = [require('../songs/still-alive/sin-lead')]
  Promise.all(tracks.map(module => module.default()))
   .then(loadedTracks => {
    fetch(require('../songs/still-alive/still-alive.mid'))
      .then(response => response.arrayBuffer())
      .then(buffer => {
        let player = new Player(buffer, loadedTracks)
        player.play()
      })
   })
}
