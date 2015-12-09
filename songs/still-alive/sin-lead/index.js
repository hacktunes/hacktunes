import {
  EVENT_MIDI_NOTE_ON,
  EVENT_MIDI_NOTE_OFF,
} from 'midievents'

export function create({ transport, res, ctx, out }) {
  const notes = {}
  const gain = ctx.createGain()
  gain.gain.value = .35
  gain.connect(out)

  transport.playMIDI(res.midi, ev => {
    if (ev.subtype === EVENT_MIDI_NOTE_ON) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.connect(gain)
      osc.frequency.value = ev.frequency
      osc.start(ev.time)
      notes[ev.note] = osc
    } else if (ev.subtype === EVENT_MIDI_NOTE_OFF) {
      const osc = notes[ev.note]
      if (!osc) {
        return
      }
      osc.stop(ev.time)
      setTimeout(function() {
        osc.disconnect()
      }, (ev.time - ctx.currentTime) * 1000)
      delete notes[ev.note]
    }
  })
}

export function load({ loadMIDI }) {
  return {
    midi: loadMIDI(require('../still-alive.mid')),
  }
}
