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

export default class Player {
  constructor(actions) {
    this.actions = actions
    this.ctx = new AudioContext()
    this.tracks = new Map()
    this.midiPlayers = new Map()
  }

  update(state) {
    const tracks = state.tracks.get(state.song, Immutable.Map())

    // clean up removed/replaced tracks
    for (let [ trackKey, trackState ] of this.tracks) {
      if (!tracks.has(trackKey) || trackState.module !== tracks.get(trackKey).module) {
        trackState.gainNode.disconnect()
        trackState.analyzerNode.disconnect()
        trackState.spyNode.disconnect()
        this.tracks.delete(trackKey)
      }
    }

    // create new tracks
    if (state.loaded) {
      for (let [ trackKey, track ] of tracks) {
        if (!this.tracks.has(trackKey) && track.fetched) {
          this.tracks.set(trackKey, this._createTrack(trackKey, state, track))
        }
      }
    }

    // take stock of needed MIDI players
    var usedMIDI = new Set()
    for (let [ trackKey, trackState ] of this.tracks) {
      for (let [ midiURL, ] of trackState.midis) {
        usedMIDI.add(midiURL)
      }
    }

    // create new MIDI players
    let songDuration = 0
    for (let midiURL of usedMIDI) {
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

    this.timeOffset = performance.now() / 1000 - this.ctx.currentTime
    for (let [ midiURL, midiPlayer ] of this.midiPlayers) {
      if (!usedMIDI.has(midiURL)) {
        // remove unused MIDI players
        midiPlayer.stop()
        this.midiPlayers.delete(midiURL)
      } else {
        // synchronize MIDI player state
        if (state.state === PLAYING && state.loaded) {
          midiPlayer.stop()
          midiPlayer.play(this._handleMIDIEnd.bind(this))
          midiPlayer.startTime = state.startTime
        } else {
          midiPlayer.stop()
        }
      }
    }

    this.actions.playerUpdateFinish(songDuration)
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
    // also 3rd and 7th arguments are placeholder times. should pull req
    // midievents to make it easier to handle single events, or modify midiplayer.
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
      // skip events in the past (due to seek, etc.)
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

  _handleMIDIEnd(trackKey, ev) {
    for (let [ , midiPlayer ] of this.midiPlayers) {
      if (midiPlayer.position !== 0) {
        return
      }
    }

    this.actions.playbackFinish()
  }
}
