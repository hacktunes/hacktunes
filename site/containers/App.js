import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as playbackStates from '../constants/playbackStates'
import * as PlayerActions from '../actions/player'
import Levels from '../components/Levels'
import clamp from '../lib/clamp'

const avatarRequire = require.context('../../meta/avatar', false, /.png$/)

function msToTimeString(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remSeconds = seconds - 60 * minutes
  return `${minutes}:${remSeconds < 10 ? '0' : ''}${remSeconds}`
}

class App extends Component {
  componentDidMount() {
    this.updateProgressHandle()
  }

  componentDidUpdate() {
    this.updateProgressHandle()
  }

  updateProgressHandle() {
    // using a CSS transform produces smoother progress movement because it's
    // not subject to pixel rounding, but it requires a bit more post-render
    // complexity, since transforms are not relative to the size of the parent.
    const { songTime, songDuration } = this.props
    const songFrac = songDuration && songTime / songDuration
    const handleWidth = this.refs.progressHandle.offsetWidth
    const progressWidth = this.refs.progress.offsetWidth
    const position = progressWidth * songFrac - handleWidth / 2
    this.refs.progressHandle.style.transform = `translateX(${position}px)`
  }

  render() {
    const { song, playerState, levels, songTime, songDuration, actions } = this.props

    const description = `This cover of Jonathan Coulton's "Still Alive" is generated on-the-fly by the following code:`
    const compMonth = 'December 2015';
    const endDate = 'December 31st';

    const songPercent = 100 * (songTime / songDuration)

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
            <div ref="progress" className="container">
              <div className="filled" style={{width: songDuration && `${songPercent}%`}} />
              <div className="duration">{msToTimeString(songDuration)}</div>
              <div ref="progressHandle" className="handle">{msToTimeString(songTime)}</div>
            </div>
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
                  <Levels levels={levels.get(trackKey)} />
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
  playerState: PropTypes.oneOf(Object.keys(playbackStates)),
  levels: PropTypes.object.isRequired,
  songTime: PropTypes.number,
  songDuration: PropTypes.number,
}

function mapStateToProps(state) {
  const songKey = state.metadata.current
  const player = state.player
  const songDuration = state.playerMetrics.songDuration
  const songTime = clamp(0, player.startTime !== null ? state.now - player.startTime : player.pauseTime, songDuration)
  return {
    song: state.metadata.songs.get(songKey),
    playerState: player.state,
    levels: state.playerMetrics.trackLevels,
    songTime,
    songDuration,
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
