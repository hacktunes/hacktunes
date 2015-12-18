import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as playbackStates from '../constants/playbackStates'
import * as UIActions from '../actions/ui'
import Slider from '../components/Slider'
import Levels from '../components/Levels'
import clamp from '../lib/clamp'

const songStyleRequire = require.context('../../songs', true, /.less$/)
const avatarRequire = require.context('../../meta/avatar', false, /.png$/)

function msToTimeString(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remSeconds = seconds - 60 * minutes
  return `${minutes}:${remSeconds < 10 ? '0' : ''}${remSeconds}`
}

const repoURL = 'https://github.com/hacktunes/hacktunes'
const aboutURL = repoURL + '#about'
const gettingStartedURL = repoURL + '#getting-started'
const chatURL = 'https://euphoria.io/room/hacktunes'

class App extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render() {
    const { songKey, song, trackStates, playerState, levels, songTime, songDuration, grabbing, seekSliderTime, songStyle, actions } = this.props

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
              <a href={aboutURL} className="whats-this">what's this?</a>
              <a href={repoURL} className="fork">fork on GitHub</a>
            </header>
            <div className="player">
              <div className="controls">
                {playButton}
                <div className="info">
                  <div className="project-name">{song.projectName}</div>
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
        <div className="song-description">{song.description}</div>
        <div className="track-list">
          {song.tracks.map((track, trackKey) => {
            const trackState = trackStates.get(trackKey)
            const trackEnabled = trackState.enabled
            const trackLevels = levels.get(trackKey)
            let avatarScale = 1
            if (trackLevels) {
              const maxLevel = clamp(0, (trackLevels.leftMax + trackLevels.rightMax) / 2, 1)
              avatarScale = 1 + .35 * maxLevel
            }
            const codeURL = `${repoURL}/blob/master/songs/${songKey}/${trackKey}/`
            return (
              <div key={trackKey} className={classNames('track', !trackEnabled && 'disabled')}>
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
                  <a href={codeURL} className="github-link" />
                  <div
                    className={classNames('active-toggle', 'toggle', trackEnabled ? 'on' : 'off')}
                    onClick={() => actions.toggleTrack(songKey, trackKey)}
                  />
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
        <div className="credits">
          {song.credits.map((credit, category) =>
            <div key={category} className="credit">
              <span className="category">{category}</span>
              <a className="author" href={credit.url}>{credit.name}</a>
            </div>
          ).valueSeq()}
        </div>
        <div className="stick-bottom">
          <a href={gettingStartedURL} className="add-promo">
            <div className="add-icon" />
            <div className="msg">
              <span className="title">Add your own track to "{song.title}"</span>
              <span className="details">Submissions end {song.projectEnd}.</span>
            </div>
          </a>
          <footer>
            <a href={aboutURL}>about</a>
            <a href={repoURL}>source code</a>
            <a href={chatURL}>community chat</a>
          </footer>
        </div>
        <style dangerouslySetInnerHTML={{__html: songStyle}} />
      </div>
    )
  }
}

App.propTypes = {
  songKey: PropTypes.string.isRequired,
  song: PropTypes.object.isRequired,
  trackStates: PropTypes.object.isRequired,
  playerState: PropTypes.oneOf(Object.keys(playbackStates)),
  levels: PropTypes.object.isRequired,
  songTime: PropTypes.number,
  songDuration: PropTypes.number,
  seekSliderTime: PropTypes.number,
  grabbing: PropTypes.bool,
  songStyle: PropTypes.string.isRequired,
}

function mapStateToProps(state) {
  const songKey = state.metadata.current
  const player = state.player
  const songDuration = state.playerMetrics.songDuration
  const songTime = clamp(0, player.startTime !== null ? state.now - player.startTime : player.pauseTime, songDuration)
  const seekSliderTime = state.ui.seekSliderDragTime !== null ? state.ui.seekSliderDragTime : songTime
  const songStyle = songStyleRequire(`./${songKey}/song.less`).toString()
  return {
    songKey,
    song: state.metadata.songs.get(songKey),
    trackStates: player.tracks.get(songKey),
    playerState: player.state,
    levels: state.playerMetrics.trackLevels,
    songTime,
    songDuration,
    seekSliderTime,
    grabbing: state.ui.grabbing,
    songStyle,
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
