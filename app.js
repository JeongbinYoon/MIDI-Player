if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

function onMIDISuccess(midiAccess) {
  console.log(midiAccess);
  midiAccess.addEventListener("statechange", updateDevices);
  const inputs = midiAccess.inputs;
  console.log(inputs);

  inputs.forEach((input) => {
    console.log(input);
    // input.onmidimessage = handleInput;
    input.addEventListener("midimessage", handleInput);
  });
}

function handleInput(input) {
  const command = input.data[0];
  const note = input.data[1];
  const velocity = input.data[2];

  switch (command) {
    case 144: // note on
      if (velocity > 0) {
        // Note is on
        noteOn(note, velocity);
      } else {
        // Note is off
        noteOff(note);
      }
      break;
    case 128: // Note off
      // Note is off
      noteOff(note);
      break;
  }
}

const noteOn = (note, velocity) => {
  console.log(note, velocity);
};

const noteOff = (note) => {
  console.log(note);
};

function updateDevices(event) {
  console.log(event);
  console.log(
    `Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`
  );
}

function onMIDIFailure() {
  console.log("Could not access your MIDI devices.");
}
