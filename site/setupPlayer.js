import Player from './lib/Player'

export default function initPlayer(store) {
  const player = new Player(buffer)

  function updatePlayer() {
    const state = store.getState()
    player.setTracks(state.tracks.get(state.metadata.current))
  }
  store.subscribe(updatePlayer)
  updatePlayer()

  return player
}
