import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as PlaybackActions from '../actions/playback'

class App extends Component {
  render() {
    const { playback, actions } = this.props
    return (
      <div>
        <button onClick={actions.startPlayback}>play</button>
        <button onClick={actions.pausePlayback}>pause</button>
        hiiiii ...!!!
        {playback.startTime}
      </div>
    )
  }
}

App.propTypes = {
}

function mapStateToProps(state) {
  return {
    playback: state.playback
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
