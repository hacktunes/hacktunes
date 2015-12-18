import {
  EVENT_MIDI_NOTE_ON,
} from 'midievents'

export function load({ loadAudio, loadMIDI }) {
  return {
    midi: loadMIDI(require('../still-alive.mid')),

    // thanks to https://freesound.org/people/lockwert/sounds/163286/
    meow: loadAudio(require('./163286__lockwert__mew-sample.wav')),
  }
}

export function create({ transport, res, ctx, out }) {
  transport.playMIDI(res.midi, ev => {
    if (ev.subtype === EVENT_MIDI_NOTE_ON && ev.channel === 0) {
      const sample = ctx.createBufferSource()
      sample.buffer = res.meow.data
      sample.playbackRate.value = 2 * ev.frequency / 400
      sample.start(ev.time)
      sample.connect(out)
    }
  })
}
