var html = require('choo/html')
var choo = require('choo')
var app = choo()

var metronome = require('./metronome')

var context = new (window.AudioContext || window.webkitAudioContext)()
var gain = context.createGain()
gain.connect(context.destination)

function playTick () {
  var time = context.currentTime
  var osc = context.createOscillator()
  osc.frequency.value = 200
  osc.connect(gain)
  osc.start(time)
  osc.stop(time + 0.01)
}

var metro = new metronome(120, 1)
var pulseTimeout = null

app.model({
  state: {
    bpm: 120,
    volume: 100,
    playing: false,
    lastInput: null,
    pulse: false
  },
  reducers: {
    updateBpm: function (state, data) {
      return { bpm: data }
    },
    updateVolume: function (state, data) {
      return { volume: data }
    },
    updatePlaying: function (state, data) {
      return { playing: data }
    },
    updateInput: function (state, data) {
      return { lastInput: data }
    },
    updatePulse: function (state, data) {
      return { pulse: data }
    }
  },
  effects: {
    setBpm: function (state, data, send, done) {
      metro.updateBpm(data)
      send('updateBpm', data, done)
    },
    setVolume: function (state, data, send, done) {
      var curVol = state.volume
      var newVol = curVol + data
      var limVol = Math.max(0, Math.min(newVol, 100))
      gain.gain.value = limVol / 100
      send('updateVolume', limVol, done)
    },
    setPlaying: function (state, data, send, done) {
      data ? metro.start() : metro.stop()
      send('updatePlaying', data, done)
    }
  },
  subscriptions: {
    onTick: function (send, done) {
      metro.on('tick', function () {
        playTick()
        send('updatePulse', true, done)
        clearTimeout(pulseTimeout)
        pulseTimeout = setTimeout(function () {
          send('updatePulse', false, done)
        }, 30)
      })
    }
  }
})

function view (state, prev, send) {
  return html`
    <main 
      class="bgc-white tc-black x xdc vh100 ff-sans fwb usn tac ofh curd" 
      tabindex="1" 
      onkeydown=${handleKey} 
      onload=${el => el.focus()}
    >
      <div class="xx x xac xjc fsvw40 ${state.pulse ? 'pulse' : ''}" sm="fsvw54">
        <div>${state.bpm}</div>
      </div>
      <div class="x xw px2 pb2 fsvw2" sm="fsvw6 px1 pb1">
        <div class="c4 x xac xjc" sm="c12 mb1 xjb">
          <span class="key curp" onclick=${handleSpace}>spacebar</span> <span class="pl1">${state.playing ? 'Stop' : 'Play'}</span>
        </div>
        <div class="c4 x xac xjc" sm="c12 mb1 xjb">
          <span class="key" onclick=${() => {
            if (window.innerWidth <= 768) {
              var bpm = prompt('Enter BPM', state.bpm)
              if (bpm) send('setBpm', Number(bpm))
            }
          }}>0 - 9</span> <span class="pl1">BPM</span>
        </div>
        <div class="c4 x xac xjc" sm="c12 xjb">
          <div class="x xac">
            <span class="key curp" onclick=${decreaseVolume}>${'<'}</span>
            <span class="px0-5">${state.volume}</span>
            <span class="key curp" onclick=${increaseVolume}>${'>'}</span>
          </div>
          <span class="pl1">Volume</span>
        </div>
      </div>
    </main>
  `

  function handleKey (e) {
    send('updateInput', Date.now())
    
    var code = e.which
    if (code >= 48 && code <= 57) {
      handleNumber(e.key)
    } else if (code === 32) {
      handleSpace()
    } else if (code === 188) {
      decreaseVolume()
    } else if (code === 190) {
      increaseVolume()
    }
  }

  function handleNumber (val) {
    var bpmString = state.bpm.toString()
    var delay = Date.now() - state.lastInput
    if (bpmString.length >= 3 || delay > 1000) {
      send('setBpm', val)
    } else {
      send('setBpm', Number(bpmString + val))
    }
  }

  function handleSpace () {
    send('setPlaying', !state.playing)
  }

  function increaseVolume () {
    send('setVolume', 10)
  }

  function decreaseVolume () {
    send('setVolume', -10)
  }
}

app.router({ default: '/' }, [ '/', view ])

var tree = app.start()
document.body.appendChild(tree)
