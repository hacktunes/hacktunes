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
  constructor(buffer) {
    this.ctx = new AudioContext()
    this.tracks = new Map()
    this.midiPlayers = new Map()
  }

  update(state) {
    const tracks = state.tracks.get(state.song)

    // clean up removed/replaced tracks
    for (let [ trackKey, trackState ] of this.tracks) {
      if (!tracks.has(trackKey) || trackState.module !== tracks.get(trackKey).module) {
        trackState.gain.disconnect()
        this.tracks.delete(trackKey)
      }
    }

    // create new tracks
    for (let [ trackKey, track ] of tracks) {
      if (!this.tracks.has(trackKey)) {
        this.tracks.set(trackKey, this._createTrack(state, track))
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
          midiPlayer.play()
          midiPlayer.startTime = state.startTime
        } else {
          midiPlayer.stop()
        }
      }
    }
  }

  _createTrack(state, track) {
    const gain = this.ctx.createGain()
    gain.connect(this.ctx.destination)

    let trackState = {
      module: track.module,
      gain,
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
      out: gain,
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
}