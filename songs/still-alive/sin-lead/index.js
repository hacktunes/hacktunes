import {
  EVENT_MIDI_NOTE_ON,
  EVENT_MIDI_NOTE_OFF,
} from 'midievents'

export function load({ loadMIDI }) {
  // Load the default MIDI file provided for the song.
  //
  // The return value of this function matches the structure of the `res`
  // object passed to create().
  return {
    midi: loadMIDI(require('../still-alive.mid')),
  }
}

export function create({ transport, res, ctx, out }) {
  // Keep a map of currently playing notes to stop on NOTE_OFF events.
  const notes = {}

  // Create a top-level gain node so we can reduce the volume output of our
  // instrument.
  const gain = ctx.createGain()
  gain.gain.value = .35

  // Connect to the track's destination output node.
  gain.connect(out)

  // Constants defining an ADSR envelope. (https://en.wikipedia.org/wiki/ADSR)
  const attack = .005
  const decay = .05
  const sustain = .35
  const release = .5

  // Queue our midi file to be played, handling the events.
  transport.playMIDI(res.midi, ev => {
    // Compare ev.subtype to the enum constants from the `midievents` module.
    if (ev.subtype === EVENT_MIDI_NOTE_ON) {
      // Create our sin wave oscillator.
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = ev.frequency * 2

      // Create a gain node for our ADSR envelope.
      const noteGain = ctx.createGain()

      // Start with gain of 0.
      noteGain.gain.setValueAtTime(0, ev.time)

      // Linearly ramp gain to 1 at `attack` time
      noteGain.gain.linearRampToValueAtTime(1, ev.time + attack)

      // Linearly ramp gain to `sustain` at `decay` time.
      noteGain.gain.linearRampToValueAtTime(sustain, ev.time + attack + decay)

      // Start our oscillator at the MIDI event time
      osc.start(ev.time)

      // Connect our nodes.
      // The overall structure will be: oscillator -> gain -> out
      osc.connect(noteGain)
      noteGain.connect(gain)

      // Store a reference to our nodes so we can stop the note below.
      notes[ev.note] = { osc, noteGain }

    } else if (ev.subtype === EVENT_MIDI_NOTE_OFF) {
      if (!notes[ev.note]) {
        // Hmm...
        return
      }

      const { osc, noteGain } = notes[ev.note]

      // Cancel any outstanding gain changes (in case the note ends before
      // ramping finishes).
      noteGain.gain.cancelScheduledValues(ev.time)
      noteGain.gain.setValueAtTime(sustain, ev.time)

      // Linearly ramp gain to 0 after release time.
      noteGain.gain.linearRampToValueAtTime(0, ev.time + release)

      // Stop the oscillator when we're not playing anything any more.
      osc.stop(ev.time + release)

      // Remove our references to the nodes.
      // The Web Audio API specifies that a reference to the oscillator will be
      // retained while it is playing, but when it finishes, it should be
      // cleaned up by the garbage collector and implicitly disconnect.
      delete notes[ev.note]
    }
  })
}
