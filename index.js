// https://mural.maynoothuniversity.ie/4697/1/JAES_V58_6_PG459hirez.pdf
let audioCtx = new AudioContext();
let phasor;

async function init() {
  await audioCtx.audioWorklet.addModule("worklet.js");
  phasor = new AudioWorkletNode(audioCtx, "modfm-processor");
  phasor.connect(masterGain);
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
