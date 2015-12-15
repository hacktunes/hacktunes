import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as playbackStates from '../constants/playbackStates'
import * as UIActions from '../actions/ui'
import Slider from '../components/Slider'
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
  render() {
    const { song, playerState, levels, songTime, songDuration, grabbing, seekSliderTime, actions } = this.props

    const repoLink = 'https://github.com/hacktunes/hacktunes'
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
      <div className={classNames('main', grabbing && 'grabbing')}>
        <div className="player-box">
          <div className="container">
            <header>
              <a href="/" className="logotype">
                <div className="logo" />
                <div className="type">hacktun.es</div>
              </a>
              <a href="FIXME" className="whats-this">what's this?</a>
              <a href={repoLink} className="fork">fork on GitHub</a>
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
          <div className={classNames('progress', playerState === playbackStates.STOPPED && 'stopped')}>
            <div className="container">
              <div className="filled" style={{width: songDuration && `${songPercent}%`}} />
              <div className="duration">{msToTimeString(songDuration)}</div>
              <Slider
                className="slider"
                value={songDuration && seekSliderTime / songDuration}
                onGrab={actions.grabSlider}
                onMove={frac => actions.moveSeekSlider(frac * songDuration)}
                onRelease={frac => actions.releaseSeekSlider(frac * songDuration)}
              >{msToTimeString(seekSliderTime)}</Slider>
            </div>
          </div>
        </div>
        <div className="song-description">
          {description}
        </div>
        <div className="track-list">
          {song.tracks.map((track, trackKey) => {
            const trackLevels = levels.get(trackKey)
            let avatarScale = 1
            if (trackLevels) {
              const maxLevel = clamp(0, (trackLevels.leftMax + trackLevels.rightMax) / 2, 1)
              avatarScale = 1 + .35 * maxLevel
            }
            return (
              <div key={trackKey} className="track">
                <div className="container">
                  <div className="avatar" style={{transform: `scale(${avatarScale})`}}>
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
                    <Levels levels={trackLevels} />
                    <div className="range-slider fader">
                      <div className="handle" style={{'left': '75%'}} />
                    </div>
                  </div>
                </div>
              </div>
            )
          }).valueSeq()}
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
            <a href={repoLink}>source code</a>
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
  seekSliderTime: PropTypes.number,
  grabbing: PropTypes.bool,
}

function mapStateToProps(state) {
  const songKey = state.metadata.current
  const player = state.player
  const songDuration = state.playerMetrics.songDuration
  const songTime = clamp(0, player.startTime !== null ? state.now - player.startTime : player.pauseTime, songDuration)
  const seekSliderTime = state.ui.seekSliderDragTime !== null ? state.ui.seekSliderDragTime : songTime
  return {
    song: state.metadata.songs.get(songKey),
    playerState: player.state,
    levels: state.playerMetrics.trackLevels,
    songTime,
    songDuration,
    seekSliderTime,
    grabbing: state.ui.grabbing,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
