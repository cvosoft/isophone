let audioCtx;
let currentOscillator = null;
let currentGainNode = null;

let isPlaying = false;
let isOver = false;

let refFreq = 1000;
let duration = 0.75; // in s

let refDB = 60;
let refGain = dBToGain(refDB);

let testFreqs = [100, 200, 500, 750, 1000, 2000, 3000, 5000];
let testdBs = Array(testFreqs.length).fill(refDB - 10);
let testGains = dBToGain(testdBs);


let stimIndex = 0; // index des test-stimulus


function onLoad() {
    document.getElementById('backButton').disabled = true;
    document.getElementById('vergleichsButton').innerHTML = `Vergleichston<br>(1/${testFreqs.length})`;
}


function updateButtonText() {
    document.getElementById("vergleichsButton").innerHTML = `Vergleichston<br>(${stimIndex + 1}/${testFreqs.length})`;
}


function renderResults() {

    let table = document.getElementById("resultTable");

    document.getElementById(`resultTable`).innerHTML += `
    <tr>
        <th>Referenz</th>
    </tr>
    <tr>
        <td>0 dB</td>
    </tr>
    <tr>
        <td><button onclick="playSound(${refFreq}, ${refGain}, ${duration})">Play</button></td>
    </td>
    `;

    for (let index = 0; index < testdBs.length; index++) {
        const freqValue = testFreqs[index];
        const dBvalue = testdBs[index] - refDB;

        document.getElementById(`resultTable`).innerHTML += `
        <tr>
            <th>${freqValue} Hz</th>
        </tr>
        <tr>
            <td> ${dBvalue} dB</td>
        </tr>
        <tr>
            <td><button onclick="playSound(${freqValue}, ${dBToGain(dBvalue + refDB)}, ${duration})">Play</button></td>
        </td>
        `;
    }




}

function disableButtons() {
    document.getElementById('nextButton').disabled = true;
    document.getElementById('refButton').disabled = true;
    document.getElementById('vergleichsButton').disabled = true;
    document.getElementById('plusButton').disabled = true;
    document.getElementById('plusPlusButton').disabled = true;
    document.getElementById('minusButton').disabled = true;
    document.getElementById('minusMinusButton').disabled = true;
    document.getElementById('backButton').disabled = true;
}

function enableButtons() {
    document.getElementById('nextButton').disabled = false;
    document.getElementById('refButton').disabled = false;
    document.getElementById('vergleichsButton').disabled = false;
    document.getElementById('plusButton').disabled = false;
    document.getElementById('plusPlusButton').disabled = false;
    document.getElementById('minusButton').disabled = false;
    document.getElementById('minusMinusButton').disabled = false;

    if (stimIndex == 0) { document.getElementById('backButton').disabled = true; }
    else {
        document.getElementById('backButton').disabled = false;
    }

}

function dBToGain(db) {
    const maxDb = 75; // 75 dB = max gain (1.0)
    const gain = Math.pow(10, (db - maxDb) / 20);
    return Math.min(Math.max(gain, 0), 1); // clamp gain between 0 and 1
}

function gainToDB(gain) {
    return 20 * Math.log10(gain) + 75
}


function plusButton() {
    testdBs[stimIndex]++;
    playSound(testFreqs[stimIndex], dBToGain(testdBs[stimIndex]), duration)
}

function plusPlusButton() {
    testdBs[stimIndex] += 2;
    playSound(testFreqs[stimIndex], dBToGain(testdBs[stimIndex]), duration)
}

function minusButton() {
    testdBs[stimIndex]--;
    playSound(testFreqs[stimIndex], dBToGain(testdBs[stimIndex]), duration)
}

function minusMinusButton() {
    testdBs[stimIndex] -= 2;
    playSound(testFreqs[stimIndex], dBToGain(testdBs[stimIndex]), duration)
}


function playSound(freq, gain, dur) {

    console.log(gainToDB(gain))

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    disableButtons();

    // Vorherigen Ton stoppen, falls vorhanden
    if (currentOscillator) {
        try {
            currentOscillator.stop();
            currentOscillator.disconnect();
        } catch (e) {
            console.warn("Oscillator already stopped");
        }
    }
    if (currentGainNode) {
        try {
            currentGainNode.disconnect();
        } catch (e) {
            console.warn("Gain node already disconnected");
        }
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

    // ⬅️ wichtig: speichern für zukünftiges Stoppen
    currentOscillator = oscillator;
    currentGainNode = gainNode;

    // Cleanup
    setTimeout(() => {
        try {
            oscillator.disconnect();
            gainNode.disconnect();
        } catch (e) {
            // evtl. schon gestoppt
        }

        // 💡 Wichtig: Referenzen zurücksetzen
        if (currentOscillator === oscillator) {
            currentOscillator = null;
            currentGainNode = null;
        }

        if (!isOver) {
            enableButtons();
        }

    }, dur * 1000 + 200);
}


function nextStimulus() {
    stimIndex++;

    if (stimIndex > 0) document.getElementById('backButton').disabled = false;


    if (stimIndex <= testFreqs.length - 1) {
        updateButtonText();
    } else {
        isOver = true;
        document.getElementById("resultCont").classList.remove("d-none");
        renderResults();
        disableButtons();
    }
}



function beforeStimulus() {
    stimIndex--;

    if (stimIndex == 0) document.getElementById('backButton').disabled = true;

    if (stimIndex <= testFreqs.length - 1) {
        updateButtonText();
    }
}
