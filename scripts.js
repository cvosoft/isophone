const freqSlider = document.getElementById("frequency");
const gainSlider = document.getElementById("volume");
const freqVal = document.getElementById("freqVal");
const gainVal = document.getElementById("gainVal");




let audioCtx, oscillator, gainNode;

freqSlider.oninput = () => {
    freqVal.textContent = freqSlider.value;
    if (oscillator) {
        oscillator.frequency.setValueAtTime(freqSlider.value, audioCtx.currentTime);
    }
};

gainSlider.oninput = () => {
    gainVal.textContent = gainSlider.value;
    if (gainNode) {
        gainNode.gain.setValueAtTime(gainSlider.value, audioCtx.currentTime);
    }
};

document.getElementById("startBtn").onclick = () => {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(freqSlider.value, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gainSlider.value, audioCtx.currentTime);

    oscillator.connect(gainNode).connect(audioCtx.destination);
    oscillator.start();
};

document.getElementById("stopBtn").onclick = () => {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
        oscillator = null;
    }
};