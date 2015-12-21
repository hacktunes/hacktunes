import Immutable from 'immutable'
import {
  EVENT_META,
  EVENT_META_TEXT,
  EVENT_MIDI_NOTE_ON,
  EVENT_MIDI_NOTE_OFF,
  createParser as createEventParser,
} from 'midievents'
import {
  PLAYING,
  PAUSED,
  STOPPED,
} from '../constants/playbackStates'
import {
  MIDI,
} from '../constants/resourceTypes'
import MIDIFile from 'midifile'
import MIDIPlayer from 'midiplayer'

// Duration tracks fade out when removed (to avoid artifacts from immediate cuts)
const trackFadeTime = .02

export default class Player {
  constructor(actions) {
    this.ctx = null
    this.actions = actions
    this.tracks = new Map()
    this.midiPlayers = new Map()
    this._startTime = null
    this._endTimeout = null
  }

  update(state) {
    this.ctx = state.ctx
    const didSeek = this._startTime !== state.startTime
    this._startTime = state.startTime

    const isPlaying = state.state === PLAYING
    const tracks = state.tracks.get(state.song, Immutable.Map())

    // Clean up removed/replaced tracks.
    for (let [ trackKey, trackState ] of this.tracks) {
      const trackRemoved = !tracks.has(trackKey)
      const trackChanged = trackState.module !== tracks.get(trackKey).module
      if (!isPlaying || didSeek || trackRemoved || trackChanged) {
        this._removeTrack(trackKey)
      }
    }

    // Create new tracks.
    if (state.loaded) {
      for (let [ trackKey, track ] of tracks) {
        if (!this.tracks.has(trackKey) && track.fetched) {
          this.tracks.set(trackKey, this._createTrack(trackKey, state, track))
        }

        const trackState = this.tracks.get(trackKey)

        // Halt / resume analyzers.
        if (isPlaying) {
          trackState.analyzerNode.connect(this.ctx.destination)
        } else {
          trackState.analyzerNode.disconnect()
        }
      }
    }

    // Take stock of needed MIDI players.
    var usedMIDI = new Map()
    for (let [ trackKey, trackState ] of this.tracks) {
      for (let [ midiURL, ] of trackState.midis) {
        usedMIDI.set(midiURL, (usedMIDI.get(midiURL) || 0) + 1)
      }
    }

    // Create new MIDI players.
    let songDuration = 0
    for (let [ midiURL, ] of usedMIDI) {
      if (!this.midiPlayers.has(midiURL)) {
        const resource = state.resources.get(midiURL)
        if (!resource.data) {
          continue
        }
        let midiFile = new MIDIFile(resource.data)
        let midiPlayer = new MIDIPlayer({
          output: { send: this._handleMIDIEvent.bind(this, midiURL) },
        })
        midiPlayer.load(midiFile)
        this.midiPlayers.set(midiURL, midiPlayer)
      }
      const midiEvents = this.midiPlayers.get(midiURL).events
      const midiDuration = midiEvents[midiEvents.length - 1].playTime
      songDuration = Math.max(songDuration, midiDuration)
    }

    const now = performance.now()

    clearTimeout(this._endTimeout)
    if (state.loaded) {
      if (isPlaying) {
        const remaining = songDuration - (now - state.startTime)
        this._endTimeout = setTimeout(this.actions.playbackFinish, remaining)
      }

      // Unload disabled tracks after loading MIDI files so that songDuration is
      // calculated with full transport.
      for (let [ trackKey, track ] of tracks) {
        if (!isPlaying || !track.enabled) {
          const trackState = this._removeTrack(trackKey)
          for (let [ midiURL, ] of trackState.midis) {
            usedMIDI.set(midiURL, usedMIDI.get(midiURL) - 1)
          }
        }
      }
    }

    this.timeOffset = now / 1000 - this.ctx.currentTime
    for (let [ midiURL, midiPlayer ] of this.midiPlayers) {
      if (usedMIDI.get(midiURL) <= 0) {
        // Remove unused MIDI players.
        midiPlayer.stop()
        this.midiPlayers.delete(midiURL)
      } else {
        // Synchronize MIDI player state.
        if (isPlaying && state.loaded) {
          if (midiPlayer.startTime !== state.startTime) {
            midiPlayer.stop()
            midiPlayer.play()
            midiPlayer.startTime = state.startTime
          }
        } else {
          midiPlayer.stop()
        }
      }
    }

    this.actions.playerUpdateFinish(songDuration)
  }

  _removeTrack(trackKey) {
    const trackState = this.tracks.get(trackKey)
    if (!trackState) {
      return
    }
    const ctxTime = this.ctx.currentTime
    const gain = trackState.gainNode.gain
    gain.cancelScheduledValues(ctxTime)
    gain.setValueAtTime(gain.value, ctxTime)
    gain.linearRampToValueAtTime(0, ctxTime + trackFadeTime)
    setTimeout(() => {
      trackState.gainNode.disconnect()
      trackState.analyzerNode.disconnect()
      trackState.spyNode.disconnect()
    }, trackFadeTime * 1000 + 100)  // 100ms slack between JS and ctx clocks.
    this.tracks.delete(trackKey)
    return trackState
  }

  _createTrack(trackKey, state, track) {
    const gainNode = this.ctx.createGain()
    gainNode.connect(this.ctx.destination)

    const analyzerNode = this.ctx.createScriptProcessor(0, 2, 2)
    analyzerNode.addEventListener('audioprocess', this._handleTrackAudio.bind(this, trackKey))
    analyzerNode.connect(this.ctx.destination)

    const spyNode = this.ctx.createGain()
    spyNode.connect(gainNode)
    spyNode.connect(analyzerNode)

    let trackState = {
      module: track.module,
      gainNode,
      analyzerNode,
      spyNode,
      midis: new Map(),
    }

    const trackTransport = {
      playMIDI(resource, onEvent) {
        if (!resource.type === MIDI) {
          throw new Error('playMIDI requires a resource of type MIDI')
        }
        trackState.midis.set(resource.url, onEvent)
      }
    }

    const trackResources = track.resources.map(res =>
      res.toMap().set('data', state.resources.get(res.url).data)
    ).toJS()

    track.module.create({
      transport: trackTransport,
      res: trackResources,
      ctx: this.ctx,
      out: spyNode,
    })

    return trackState
  }

  _handleMIDIEvent(midiURL, data, time) {
    // FIXME: work around midievents expecting more than one event.
    // Also 3rd and 7th arguments are placeholder times. Should pull req
    // midievents to make it easier to handle single events, or modify
    // midiplayer.
    data.splice(0, 0, 0, EVENT_META, EVENT_META_TEXT, 0, 0)
    const dataView = new DataView(new Uint8Array(data).buffer)
    const parser = createEventParser(dataView)
    parser.next()
    const ev = parser.next()
    delete ev.index
    delete ev.delta
    ev.time = time / 1000 - this.timeOffset
    ev.midi = {data, time}

    if (ev.time <= this.ctx.currentTime) {
      // Skip events in the past (due to seek, etc.)
      return
    }

    if (ev.type === EVENT_MIDI_NOTE_ON || ev.type === EVENT_MIDI_NOTE_OFF) {
      ev.note = ev.param1
      // https://en.wikipedia.org/wiki/MIDI_Tuning_Standard#Frequency_values
      ev.frequency = Math.pow(2, (ev.note - 69) / 12) * 440
    }

    for (let [trackKey, track] of this.tracks) {
      const subscription = track.midis.get(midiURL)
      if (subscription) {
        subscription(Object.assign({}, ev))
      }
    }
  }

  _handleTrackAudio(trackKey, ev) {
    if (!this.tracks.has(trackKey)) {
      return
    }

    const sampleCount = 100
    const levels = {}
    const buf = ev.inputBuffer
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const data = buf.getChannelData(c)
      const step = Math.floor(data.length / sampleCount)
      let sum = 0
      let max = 0
      for (let i = 0; i < data.length; i += step) {
        sum += Math.abs(data[i])
        max = Math.max(max, data[i])
      }
      const avg = sum / sampleCount

      const channel = c === 0 ? 'left' : 'right'
      levels[channel + 'Avg'] = avg
      levels[channel + 'Max'] = max
      levels[channel + 'Clip'] = max > 1
    }

    this.actions.updateTrackLevels(trackKey, levels)
  }
}
