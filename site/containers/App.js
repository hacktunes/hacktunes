import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as playbackStates from '../constants/playbackStates'
import * as PlayerActions from '../actions/player'
import Levels from '../components/Levels'

const avatarRequire = require.context('../../meta/avatar', false, /.png$/)

class App extends Component {
  render() {
    const { song, now, playerState, actions } = this.props

    const description = `This cover of Jonathan Coulton's "Still Alive" is generated on-the-fly by the following code:`
    const compMonth = 'December 2015';
    const endDate = 'December 31st';

    let playButton
    if (playerState === playbackStates.PLAYING) {
      playButton = <button className="play-toggle pause" onClick={actions.pausePlayback} />
    } else {
      // TODO: loading state
      playButton = <button className="play-toggle play" onClick={actions.fetchAndStartPlayback} />
    }

    return (
      <div className="main">
        <div className="player-box">
          <div className="container">
            <header>
              <a href="/" className="logotype">
                <div className="logo" />
                <div className="type">hacktun.es</div>
              </a>
              <a href="FIXME" className="whats-this">what's this?</a>
              <a href="FIXME" className="fork">fork on GitHub</a>
            </header>
            <div className="player">
              <div className="controls">
                {playButton}
                <div className="info">
                  <div className="comp">{compMonth}</div>
                  <div className="title">{song.title}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="progress">

          </div>
        </div>
        <div className="song-description">
          {description}
        </div>
        <div className="track-list">
          {song.tracks.map((track, trackKey) => (
            <div key={trackKey} className="track">
              <div className="container">
                <div className="avatar">
                  <img src={avatarRequire('./' + track.author.email + '.png')} alt="" />
                </div>
                <div className="track-info">
                  <div className="name-line">
                    <span className="name">{track.name}</span>
                    <span className="by"> by </span>
                    <a href={track.author.url} className="author">{track.author.name}</a>
                  </div>
                  <div className="description">{track.description}</div>
                </div>
                <div className="spacer" />
                <a href="FIXME" className="github-link" />
                <div className="active-toggle toggle on" />
                <div className="levels-container">
                  <Levels leftDark={.5} leftLight={.9} rightDark={.3} rightLight={.7} />
                  <div className="range-slider fader">
                    <div className="handle" style={{'left': '75%'}} />
                  </div>
                </div>
              </div>
            </div>
          )).valueSeq()}
        </div>
        <div className="stick-bottom">
          <a href="FIXME" className="add-promo">
            <div className="add-icon" />
            <div className="msg">
              <span className="title">Add your own track to "{song.title}"</span>
              <span className="details">Submissions end {endDate}.</span>
            </div>
          </a>
          <footer>
            <a href="FIXME">about</a>
            <a href="FIXME">source code</a>
            <a href="FIXME">community chat</a>
          </footer>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  song: PropTypes.object.isRequired,
  now: PropTypes.number.isRequired,
  playerState: PropTypes.oneOf(Object.keys(playbackStates)),
}

function mapStateToProps(state) {
  const songKey = state.metadata.current
  const player = state.player
  return {
    song: state.metadata.songs.get(songKey),
    now: state.now,
    playerState: player.state,
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
