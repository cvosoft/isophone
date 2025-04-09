let audioCtx;
let currentOscillator = null;
let currentGainNode = null;

let isPlaying = false;

let refFreq = 1000;
let duration = 0.5; // in s

let refDB = 65;
let refGain = dBToGain(refDB);

let testFreqs = [125, 250, 500, 750, 1000, 2000, 3000, 4000, 6000, 8000];
let testdBs = Array(testFreqs.length).fill(refDB - 20);
let testGains = dBToGain(testdBs);


let stimIndex = 0; // index des test-stimulus

function updateButtonText() {
    document.getElementById("vergleichsButton").innerHTML = `Vergleichston<br>(${stimIndex + 1}/8)`;
}


function renderResults(){
    for (let index = 0; index < testdBs.length; index++) {
        const element = testdBs[index] - refDB;
        document.getElementById(`result${index}`).innerHTML = `${element}`;

    }
}


function dBToGain(db) {
    const maxDb = 95; // 95 dB = max gain (1.0)
    const gain = Math.pow(10, (db - maxDb) / 20);
    console.log(gain)
    return Math.min(Math.max(gain, 0), 1); // clamp gain between 0 and 1
}


function playSound(freq, gain, dur) {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    const now = audioCtx.currentTime;
    const fadeTime = 0.05; // 100 ms

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);

    // Gain: Fade-In & Fade-Out
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gain, now + fadeTime); // Fade-in
    gainNode.gain.setValueAtTime(gain, now + dur - fadeTime);
    gainNode.gain.linearRampToValueAtTime(0, now + dur); // Fade-out

    oscillator.connect(gainNode).connect(audioCtx.destination);
    oscillator.start(now);
    oscillator.stop(now + dur);

    // Cleanup
    setTimeout(() => {
        oscillator.disconnect();
        gainNode.disconnect();
    }, dur * 1000 + 200); // 100ms extra wegen Fade
}



function playRefSound() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!isPlaying) {
        console.log("Spiele Referenzton");

        // Neues Oszillator-Setup bei jedem Start
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(refFreq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(refGain, audioCtx.currentTime);

        oscillator.connect(gainNode).connect(audioCtx.destination);
        oscillator.start();

        currentOscillator = oscillator;
        currentGainNode = gainNode;
        isPlaying = true;
    } else {
        console.log("Stoppe Referenzton");

        if (currentOscillator) {
            currentOscillator.stop();
            currentOscillator.disconnect();
        }
        if (currentGainNode) {
            currentGainNode.disconnect();
        }

        currentOscillator = null;
        currentGainNode = null;
        isPlaying = false;
    }
}
