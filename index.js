// https://mural.maynoothuniversity.ie/4697/1/JAES_V58_6_PG459hirez.pdf
let audioCtx = new AudioContext();
let phasor;
let midi = null;

async function init() {
  // Set up synth worklet
  await audioCtx.audioWorklet.addModule("worklet.js");
  phasor = new AudioWorkletNode(audioCtx, "modfm-processor");
  phasor.connect(masterGain);

  // Add spectrum analyser
  const audioMotion = new AudioMotionAnalyzer(
    document.getElementById('spectrum'),
    {
        source: phasor
    }
  );

  // Attach midi
  await navigator.requestMIDIAccess().then(()=>{
    // Success
    midi = midi.Access;
    console.log("MIDI enabled");
    Array.from(MIDIAccess.inputs).forEach((input)=>{
      input[1].onmidimessage = (msg) => {
        console.log(msg);
      };
    });
  },
  (msg)=>{
    console.error(`Failed to get MIDI access - ${msg}`);
  });
}

let masterGain = audioCtx.createGain();
masterGain.gain.value = 1;
masterGain.connect(audioCtx.destination);

document.getElementById("t").addEventListener("click", async () => {
  console.log(audioCtx.state);
  //if (audioCtx.state === "suspended")
  audioCtx.resume();
  let t = audioCtx.currentTime;
  masterGain.gain.setTargetAtTime(1, t, 0.1);
  //masterGain.gain.setTargetAtTime(0, t + 1, 5);
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

init();

function midi_handler(e) {
  if (len(e) < 1) return;
  const ch = e & 0xf;
  switch(e & 0xf0) {
    case 0x80:
      if (len(e) == 3) {
        if (e[2] > 0) {
          midi_note_on(ch, e[1], e[2]);
        } else {
          midi_note_off(ch, e[1], 127);
        }
      }
      break;
    case 0x90:
      if (len(e) == 3) {
        midi_note_off(ch, e[1], e[2]);
      }
      break;
    case 0xA0:
      if (len(e) == 3) {
        midi_key_pressure(ch, e[1], e[2]);
      }
      break;
    case 0xB0:
      if (len(e) == 3) {
        midi_controller_change(ch, e[1], e[2]);
      }
      break;
    case 0xC0:
      if (len(e) == 2) {
        midi_program_change(ch, e[1]);
      }
      break;
    case 0xD0:
      if (len(e) == 2) {
        midi_channel_pressure(ch, e[1]);
      }
      break;
    case 0xE0:
      if (len(e) == 3) {
        midi_pitch_bend(ch, e[1] + e[2] * 128);
      }
    case 0xF0:
      if (e[0] == 0xFF) {
        midi_system_reset();
      }
      break;
  }
}

function midi_note_on(ch, key, velocity) {
  // Trigger note
}

function midi_note_off(ch, key, velocity) {

}

function midi_key_pressure(ch, key, pressure) {

}

function midi_controller_change(ch, controller, value) {

}

function midi_program_change(ch, program) {

}

function midi_channel_pressure(ch, pressure) {

}

function midi_pitch_bend(ch, pitch) {

}

function midi_system_reset() {
  // Turn off all keys
}

