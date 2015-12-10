import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { PLAYING } from '../constants/playbackStates'
import * as PlayerActions from '../actions/player'

class App extends Component {
  render() {
    const { metadata, now, player, actions } = this.props

    const tracks = metadata.songs[metadata.current].tracks
    return (
      <div>
        <button onClick={() => actions.fetchAndStartPlayback(metadata.current)}>play</button>
        <button onClick={actions.pausePlayback}>pause</button>
        <div>progress: {player.state === PLAYING ? now - player.startTime : player.pauseTime}</div>
        {Object.keys(tracks).map(trackKey => {
          return <div key={trackKey}>{JSON.stringify(tracks[trackKey])} {JSON.stringify(player.tracks.get(metadata.current))}</div>
        })}
      </div>
    )
  }
}

App.propTypes = {
}

function mapStateToProps(state) {
  return {
    metadata: state.metadata,
    now: state.now,
    player: state.player,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(PlayerActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
