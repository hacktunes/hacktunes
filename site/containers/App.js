import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as PlaybackActions from '../actions/playback'

class App extends Component {
  render() {
    const { playback, metadata, actions } = this.props

    const tracks = metadata.songs[metadata.current].tracks
    return (
      <div>
        <button onClick={actions.startPlayback}>play</button>
        <button onClick={actions.pausePlayback}>pause</button>
        hiiiii ...!!!
        {playback.startTime}
        {Object.keys(tracks).map(trackKey => {
          return <div key={trackKey}>{JSON.stringify(tracks[trackKey])}</div>
        })}
      </div>
    )
  }
}

App.propTypes = {
}

function mapStateToProps(state) {
  return {
    playback: state.playback,
    metadata: state.metadata,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(PlaybackActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
