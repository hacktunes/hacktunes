import {
  EVENT_META,
  EVENT_META_TEXT,
  EVENT_MIDI_NOTE_ON,
  EVENT_MIDI_NOTE_OFF,
  createParser as createEventParser,
} from 'midievents'
import MIDIFile from 'midifile'
import MIDIPlayer from 'midiplayer'

export default class Player {
  constructor(buffer, tracks) {
    this.midiFile = new MIDIFile(buffer)
    this.midiPlayer = new MIDIPlayer({
      output: {send: this._handleMIDIEvent.bind(this)},
    })
    this.midiPlayer.load(this.midiFile)
    this.tracks = tracks
    this.ctx = new AudioContext()
    this.trackGains = tracks.map(() => {
      const gain = this.ctx.createGain()
      gain.connect(this.ctx.destination)
      return gain
    })
    window.ctx = this.ctx
  }

  play() {
    this.timeOffset = performance.now() / 1000 - ctx.currentTime
    this.midiPlayer.play()
  }

  _handleMIDIEvent(data, time) {
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

    if (ev.type === EVENT_MIDI_NOTE_ON || ev.type === EVENT_MIDI_NOTE_OFF) {
      ev.note = ev.param1
      // https://en.wikipedia.org/wiki/MIDI_Tuning_Standard#Frequency_values
      ev.frequency = Math.pow(2, (ev.note - 69) / 12) * 440
    }

    this.tracks.forEach((track, idx) => track(ev, this.ctx, this.trackGains[idx]))
  }
}
