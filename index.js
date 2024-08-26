// https://mural.maynoothuniversity.ie/4697/1/JAES_V58_6_PG459hirez.pdf
let audioCtx = null;
let phasor;
let masterGain;
let midi = null;

function init_synth() {
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 1;
  masterGain.connect(audioCtx.destination);

  phasor = new AudioWorkletNode(audioCtx, "modfm-processor");
  phasor.connect(masterGain);

  // const audioMotion = new AudioMotionAnalyzer(
  //   document.getElementById('spectrum'),
  //   {
  //     source: phasor,
  //     height: "100px"
  //   }
  // );
}
function onKeyChange(ch, note, velocity) {
  let frequency = 440 * Math.pow(2, (note - 69)/12);
  if (velocity > 0) {
    document.getElementById("fm").value = Math.round(frequency);
    phasor.parameters.get("fm").setValueAtTime(frequency, 0);
  }
}

function onControlChange(ch, cc, value) {
  let code = (ch << 8) + cc;
  switch (code) {
    case 0x014: // Ch 0 CC20
      document.getElementById("ff").value = value * 10;
      phasor.parameters.get("ff").setValueAtTime(value * 10, 0);
      break;
    case 0x015: // Ch 0 CC21
      document.getElementById("fm").value = value * 10;
      phasor.parameters.get("fm").setValueAtTime(value * 10, 0);
      break;
    case 0x016: // Ch 0 CC22
      document.getElementById("B").value = value * 10;
      phasor.parameters.get("B").setValueAtTime(value * 10, 0);
      break;
  }
}

function onMidiMessage(e) {
  if (e.data.length > 0) {
    let msg_type = (e.data[0] & 0xf0);
    let channel = e.data[0] & 0x0f;
    //console.log(e.data);
    switch (msg_type) {
      case 0x80:
        onKeyChange(channel, e.data[1], 0);
        console.log(`Note off Ch:${channel} Key:${e.data[1]} Velocity:${e.data[2]}`);
        break;
      case 0x90:
        onKeyChange(channel, e.data[1], e.data[2]);
        console.log(`Note on Ch:${channel} Key:${e.data[1]} Velocity:${e.data[2]}`);
        break;
      case 0xB0:
        //console.log(`Control change Ch:${channel} CC:${e.data[1]} Position:${e.data[2]}`);
        onControlChange(channel, e.data[1], e.data[2]);
        break;
      case 0xf0:
        // Skip all sys messages
        break;
      default:
        console.log(e.data);
    }

  }
  //console.log(e.timeStamp, e.data);
}

async function init() {
  // Set up synth worklet
  await audioCtx.audioWorklet.addModule("worklet.js");
  init_synth();
  masterGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.1);

  // Attach midi
  navigator.permissions.query({
    name: "midi",
    sysex: true,
  }).then((result) => {
    console.log(result);
  });
  navigator.requestMIDIAccess().then(
    (access) => {
      midi = access;
      midi.inputs.forEach(entry => { entry.onmidimessage = onMidiMessage; });
    },
    (msg) => {
      console.error(`requestMIDIAccess failed ${msg}`);
    }
  );
  console.log("Attempting to get MIDI access 2");
}

document.getElementById("start").addEventListener("click", async () => {
  // Initiated by click
  audioCtx = new AudioContext();
  init();
})

document.getElementById("t").addEventListener("click", async () => {
  // Obsolete
  console.log(audioCtx.state);
  audioCtx.resume();
  let t = audioCtx.currentTime;
  masterGain.gain.setTargetAtTime(1, t, 0.1);
});

document.getElementById("mute").addEventListener("click", async () => {
  masterGain.gain.setValueAtTime(0, 0, 10);
});

document.getElementById("ff").addEventListener("input", (evt) => {
  phasor.parameters.get("ff").setValueAtTime(evt.target.value, 0);
  console.log("Set ff to ", evt.target.value);
});
document.getElementById("fm").addEventListener("input", (evt) => {
  phasor.parameters.get("fm").setValueAtTime(evt.target.value, 0);
  console.log("Set fm to ", evt.target.value);
});
document.getElementById("B").addEventListener("input", (evt) => {
  phasor.parameters.get("B").setValueAtTime(evt.target.value, 0);
  console.log("Set B to ", evt.target.value);
});

//init();
