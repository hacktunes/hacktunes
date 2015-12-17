<img id="about" src="https://raw.githubusercontent.com/hacktunes/hacktunes/master/art/logotype-color.png" alt="hacktun.es" height="75" />

Hacktunes is a monthly collaborative music programming project. Each month, we pick a song to cover using the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API). Anyone can contribute tracks (written in JavaScript/ES6) which generate a part of the song in real-time. We mash all of these tracks together into a combined performance, creating a [Hacktune](hacktun.es)!

This month, we're covering [Still Alive](https://www.youtube.com/watch?v=RthZgszykLs) by [Jonathan Coulton](http://www.jonathancoulton.com/).

---

## How it works

To make songs, we need two things: instruments (:guitar::saxophone::microphone:), and a sequence of notes to play (:musical_score:). Hacktunes "tracks" are instruments using the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), triggered by [MIDI events](https://en.wikipedia.org/wiki/MIDI). We provide a basic MIDI file as a starting point, but can add your own to make new melodies and rhythms. You can implement synthesizers, drum machines, sample audio clips, etc -- the sky's the limit!


The `hacktunes` codebase doubles as a development environment. We use [Hot Module Replacement](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html) to update tracks immediately: you can make changes to the code during playback and hear them live! :zap::zap::zap:

### Getting started

1. Clone the repository.
2. `npm install`
3. `npm start`

The best way to jump in is to modify an existing track. Hear something you like? Copy it and start playing around. This month's tracks can be found in [`/songs/still-alive`](https://github.com/hacktunes/hacktunes/tree/master/songs/still-alive).

### Submitting a track to "Still Alive" (December 2015)

Everyone is welcome to contribute!

1. Build your own track in a subdirectory of [`/songs/still-alive`](https://github.com/hacktunes/hacktunes/tree/master/songs/still-alive)
2. Send us a pull request (squash your commits, please!)

When we merge your commit, your track will automatically go live on [hacktun.es](http://hacktun.es).

## API

:construction: Hacktunes is in early development. Need something that isn't listed here? Please [file an issue](https://github.com/hacktunes/hacktunes/issues/new) for discussion.

:zap: Prefer to read code? Here's an [annotated example](https://github.com/hacktunes/hacktunes/blob/master/songs/still-alive/sin-lead/index.js).

Your track is a module consisting two functions: `load`, and `create`.

### `load({ loadMIDI })`

Declare resources your track needs to fetch here.

Return an object mapping resource names to resources (see below).

#### `loadMIDI(url)`

Fetch a MIDI file at the specified URL. Use the `require` function to refer to file paths relative to the current module.

#### Example:

```js
export function load({ loadMIDI }) {
  return {
    midi: loadMIDI(require('../still-alive.mid')),
  }
}
```

### `create({ transport, res, ctx, out })`

Instantiate an instrument and trigger it by playing MIDI files. This will be called before the song begins, as well as any time your track [hot reloads](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html).

#### `transport.playMIDI(midiResource, eventHandler)`

Queue a MIDI file to be played. Pass it a MIDI resource from `res`. While playing, your `eventHandler` will be called with MIDI events right before they happen. Use this callback to queue Web Audio operations at the precise time specified by each MIDI event.

##### MIDI events

Your `eventHandler(ev)` callback will be called with MIDI events of the following structure:

```js
{
  "time": 2545.03,                           // Precise AudioContext event time (seconds)
  "channel": 0,                              // MIDI channel number
  "note": 66,                                // MIDI note number
  "frequency": 369.99,                       // Note frequency (Hz)
  "type": 8,                                 // MIDI event type constant
  "subtype": 8,                              // MIDI event subtype constant
  "param1": 66,                              // MIDI event param value
  "param2": 0,                               // MIDI event param value
  "midi": {
    "data": [0, 255, 1, 0, 0, 128, 66, 0 ],  // Raw MIDI protocol bytes, suitable for Web MIDI API
    "time": 2545670.91,                      // Web MIDI time (ms relative to navigation start)
  },
}
```

Event type constants can be imported from the `midievents` module:

```js
import {
  EVENT_MIDI_NOTE_ON,
  EVENT_MIDI_NOTE_OFF,
} from 'midievents'
```

#### `res`

An object containing fetched resources specified by your `load` function.

#### `ctx`

The [`AudioContext`](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) for the playing song.

#### `out`

The destination [`AudioNode`](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode) to output audio to. Connect your [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) nodes here.

#### Example

```js
import { EVENT_MIDI_NOTE_ON } from 'midievents'

export function create({ transport, res, ctx, out }) {
  transport.playMIDI(res.midi, ev => {
    if (ev.subtype === EVENT_MIDI_NOTE_ON) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = ev.frequency
      noteGain.gain.setValueAtTime(0, ev.time)
      noteGain.gain.linearRampToValueAtTime(1, ev.time + 10)
      noteGain.gain.linearRampToValueAtTime(0, ev.time + 100)
      osc.start(ev.time)
      osc.stop(ev.time + 100)
      osc.connect(out)
    }
  })
}
```
