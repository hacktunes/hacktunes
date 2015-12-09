import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as PlayerActions from '../actions/player'

class App extends Component {
  render() {
    const { metadata, player, actions } = this.props

    const tracks = metadata.songs[metadata.current].tracks
    return (
      <div>
        <button onClick={actions.startPlayback}>play</button>
        <button onClick={actions.pausePlayback}>pause</button>
        hiiiii ...!!!
        {player.startTime}
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
