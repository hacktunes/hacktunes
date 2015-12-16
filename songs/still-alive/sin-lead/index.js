import {
  EVENT_MIDI_NOTE_ON,
  EVENT_MIDI_NOTE_OFF,
} from 'midievents'

export function create({ transport, res, ctx, out }) {
  const notes = {}
  const gain = ctx.createGain()
  gain.gain.value = .35
  gain.connect(out)

  const attack = .005
  const decay = .05
  const sustain = .35
  const release = .5
  transport.playMIDI(res.midi, ev => {
    if (ev.subtype === EVENT_MIDI_NOTE_ON) {
      const osc = ctx.createOscillator()
      const noteGain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = ev.frequency * 2
      noteGain.gain.setValueAtTime(0, ev.time)
      noteGain.gain.linearRampToValueAtTime(1, ev.time + attack)
      noteGain.gain.linearRampToValueAtTime(sustain, ev.time + attack + decay)
      osc.start(ev.time)
      osc.connect(noteGain)
      noteGain.connect(gain)
      notes[ev.note] = { osc, noteGain }
    } else if (ev.subtype === EVENT_MIDI_NOTE_OFF) {
      if (!notes[ev.note]) {
        return
      }
      const { osc, noteGain } = notes[ev.note]
      noteGain.gain.cancelScheduledValues(ev.time)
      noteGain.gain.setValueAtTime(sustain, ev.time)
      noteGain.gain.linearRampToValueAtTime(0, ev.time + release)
      osc.stop(ev.time + release)
      setTimeout(function() {
        noteGain.disconnect()
        osc.disconnect()
      }, (ev.time - ctx.currentTime + release) * 1000)
      delete notes[ev.note]
    }
  })
}

export function load({ loadMIDI }) {
  return {
    midi: loadMIDI(require('../still-alive.mid')),
  }
}
