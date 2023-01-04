window.AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx;

const startButton = document.querySelector(".startCtx");
const oscillators = {};
startButton.addEventListener("click", () => {
  ctx = new window.AudioContext();
  console.log(ctx);
});

function midiToFreq(number) {
  const a = 440;
  return (a / 32) * 2 ** ((number - 9) / 12);
}

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

// requiestMIDIAccess에 성공한 경우
function onMIDISuccess(midiAccess) {
  midiAccess.addEventListener("statechange", updateDevices);

  const inputs = midiAccess.inputs;
  console.log(inputs);
  inputs.forEach((input) => {
    console.log(input);
    input.addEventListener("midimessage", handleInput);
  });
}

function handleInput(input) {
  const command = input.data[0];
  const note = input.data[1];
  const velocity = input.data[2];
  console.log(command, note, velocity);

  switch (command) {
    case 144:
      if (velocity > 0) {
        // 건반이 눌렸을 때
        noteOn(note, velocity);
      } else {
        // 건반이 떨어질 때
        noteOff(note);
      }
      break;
    case 128:
      // 건반이 떨어질 때
      noteOff(note);
      break;
  }
}

function noteOn(note, velocity) {
  const osc = ctx.createOscillator();

  const oscGain = ctx.createGain();
  oscGain.gain.value = 0.33;

  const velocityGainAmount = (1 / 127) * velocity;
  const velocityGain = ctx.createGain();
  velocityGain.gain.value = velocityGainAmount;

  osc.type = "sine";
  osc.frequency.value = midiToFreq(note);

  osc.connect(oscGain);
  oscGain.connect(velocityGain);
  velocityGain.connect(ctx.destination);

  osc.gain = oscGain;
  console.log(osc);
  oscillators[note.toString()] = osc;
  console.log(oscillators);

  osc.start();
}

function noteOff(note) {
  const osc = oscillators[note.toString()];
  const oscGain = osc.gain;

  oscGain.gain.setValueAtTime(oscGain.gain.value, ctx.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

  setTimeout(() => {
    osc.stop();
    osc.disconnect();
  }, 30);

  delete oscillators[note.toString()];
  console.log(oscillators);
}

function updateDevices(event) {
  console.log(
    `Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`
  );
}

function onMIDIFailure() {
  console.log("Could not access your MIDI devices.");
}
