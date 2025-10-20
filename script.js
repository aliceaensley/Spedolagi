// =======================================================
// VARIABEL GLOBAL & KONFIGURASI AUDIO
// =======================================================
let elements = {};
let speedMode = 1; 
let indicators = 0;
let currentStationIndex = 0;

const onOrOff = state => state ? 'On' : 'Off';

// --- DAFTAR RADIO STREAMING INDONESIA (Contoh) ---
const RADIO_STATIONS = [
    { name: "Global Radio Jakarta", url: "https://stream.globalsuara.com/globalradiojakarta" },
    { name: "Prambors Jakarta", url: "https://stream.globalsuara.com/pramborsjakarta" },
    { name: "Hard Rock FM", url: "https://stream.globalsuara.com/hardrockfmjakarta" },
    { name: "Delta FM", url: "https://stream.globalsuara.com/deltafmjakarta" },
    { name: "Vibe Indo (EDM)", url: "https://stream.globalsuara.com/deltafmjakarta" }
];

// MENGGUNAKAN NAMA FILE LOKAL (yamete.mp3)
const YAMETE_AUDIO_URL = 'yamete.mp3'; 
const yameteAudio = new Audio(YAMETE_AUDIO_URL);
yameteAudio.volume = 0.5;

// Objek Audio untuk Radio Online
const radioAudio = new Audio();
radioAudio.volume = 0.3; 
let isRadioPlaying = false;


// =======================================================
// FUNGSI RADIO MANDIRI
// =======================================================

function updateRadioDisplay() {
    const radioStatusElement = document.getElementById('radio-status');
    const playPauseButton = document.getElementById('play-pause-radio');
    const stationLabel = document.querySelector('.radio-box .station-label');
    const radioBoxHeader = document.querySelector('.radio-box .radio-header');
    
    const stationName = isRadioPlaying ? RADIO_STATIONS[currentStationIndex].name : 'OFF';

    // Update Status
    if (radioStatusElement) {
        radioStatusElement.innerText = stationName.toUpperCase();
        radioStatusElement.style.color = isRadioPlaying ? '#00ffff' : '#ffaa00';
    }

    // Update Play/Pause Icon
    if (playPauseButton) {
        const iconPath = isRadioPlaying 
            ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>' // Pause icon
            : '<path d="M8 5v14l11-7z"/>'; // Play icon
        playPauseButton.innerHTML = `<svg viewBox="0 0 24 24" fill="white">${iconPath}</svg>`;
    }

    // Update Header Color
    if (radioBoxHeader) {
        radioBoxHeader.style.color = isRadioPlaying ? '#66ccff' : '#00ffff';
    }

    // Update Label 'Station'
    if (stationLabel) {
        stationLabel.innerText = isRadioPlaying ? 'STATION' : 'SELECT STATION';
    }
}

function startRadio() {
    if (isRadioPlaying && radioAudio.src === RADIO_STATIONS[currentStationIndex].url) {
        return; 
    }
    
    radioAudio.pause();
    
    radioAudio.src = RADIO_STATIONS[currentStationIndex].url;
    radioAudio.load();
    radioAudio.play().then(() => {
        isRadioPlaying = true;
        updateRadioDisplay();
    }).catch(e => {
        isRadioPlaying = false;
        updateRadioDisplay();
        console.error("Error playing radio (stream):", e);
        document.getElementById('radio-status').innerText = 'ERROR';
        document.getElementById('radio-status').style.color = '#ff0000';
    });
}

function stopRadio() {
    radioAudio.pause();
    radioAudio.src = ""; 
    isRadioPlaying = false;
    updateRadioDisplay();
}

function togglePlayPause() {
    if (isRadioPlaying) {
        stopRadio();
    } else {
        startRadio();
    }
}

function changeStation(direction) {
    stopRadio();
    
    currentStationIndex += direction;
    
    if (currentStationIndex >= RADIO_STATIONS.length) {
        currentStationIndex = 0;
    } else if (currentStationIndex < 0) {
        currentStationIndex = RADIO_STATIONS.length - 1;
    }
    
    startRadio();
}

// =======================================================
// FUNGSI SETTER DASHBOARD
// =======================================================

function setEngine(state) {
    document.getElementById('engine-icon').classList.toggle('active', state);
    elements.engine.innerText = onOrOff(state); 
}

function setSpeed(speed_ms) {
    let speedDisplay;
    switch(speedMode) {
        case 1: speedDisplay = Math.round(speed_ms * 2.236936); break; 
        case 2: speedDisplay = Math.round(speed_ms * 1.943844); break; 
        default: speedDisplay = Math.round(speed_ms * 3.6); 
    }
    elements.speed.innerText = speedDisplay; 
    
    const maxDots = 4;
    let scaleMax = speedMode === 1 ? 120 : 180; 
    let powerLevel = Math.min(maxDots, Math.ceil(speedDisplay / (scaleMax / maxDots))); 
    const powerDots = document.querySelectorAll('.power-bar-dots .dot');
    powerDots.forEach((dot, index) => {
        dot.classList.toggle('active', index < powerLevel);
    });
}

function setFuel(fuel_01) {
    const fuel_100 = Math.max(0, Math.min(100, fuel_01 * 100));
    const fuelPercentElement = document.getElementById('fuel-percent');

    document.getElementById('fuel-fill').style.height = `${Math.round(fuel_100)}%`;
    
    if (fuelPercentElement) {
        fuelPercentElement.textContent = `${Math.round(fuel_100)}%`; 
    }

    elements.fuel.innerText = `${fuel_100.toFixed(1)}%`;
}

function setHealth(health_01) {
    const health_100 = Math.max(0, Math.min(100, health_01 * 100));
    const healthFill = document.getElementById('health-fill');
    const healthPercentElement = document.getElementById('health-percent');
    
    if (healthFill) {
        healthFill.style.height = `${Math.round(health_100)}%`;
    }
    
    if (healthPercentElement) {
        healthPercentElement.textContent = `${Math.round(health_100)}%`; 
    }
    
    if (healthFill) {
        if (health_100 < 30) {
            healthFill.style.backgroundColor = '#ff0000'; 
        } else if (health_100 < 60) {
            healthFill.style.backgroundColor = '#ffff00'; 
        } else {
            healthFill.style.backgroundColor = '#00ff00'; 
        }
    }

    elements.health.innerText = `${health_100.toFixed(1)}%`;
}

function setGear(gear) {
    const gearElement = document.getElementById('gear');
    if (!gearElement) return;

    let displayGear = String(gear).toUpperCase();
    
    if (displayGear === '0') {
        displayGear = 'N'; 
    } 
    
    gearElement.innerText = displayGear;
    
    gearElement.style.color = (displayGear === 'R' || displayGear === 'N') ? '#ff0000' : '#fff'; 
}

function setHeadlights(state) {
    let display = 'Off';
    if (state === 1 || state === 2) display = 'On';

    document.getElementById('headlights-icon').classList.toggle('active', display !== 'Off');
}

let blinkInterval;
let lastIndicatorState = 0;

function controlIndicators(state) {
    const turnLeft = document.getElementById('turn-left-icon'); 
    const turnRight = document.getElementById('turn-right-icon'); 

    if (state !== lastIndicatorState) {
        clearInterval(blinkInterval);
        turnLeft.classList.remove('active');
        turnRight.classList.remove('active');

        if (state === 1) { 
            blinkInterval = setInterval(() => { turnLeft.classList.toggle('active'); }, 250);
        } else if (state === 2) { 
            blinkInterval = setInterval(() => { turnRight.classList.toggle('active'); }, 250);
        } else if (state === 3) { 
             blinkInterval = setInterval(() => { 
                turnLeft.classList.toggle('active');
                turnRight.classList.toggle('active');
             }, 250);
        }
    }
    lastIndicatorState = state;
}

function setLeftIndicator(state) {
    indicators = (indicators & 0b10) | (state ? 0b01 : 0b00);
    controlIndicators(indicators);
}

function setRightIndicator(state) {
    indicators = (indicators & 0b01) | (state ? 0b10 : 0b00);
    controlIndicators(indicators);
}

function setSeatbelts(state) {
    const seatbeltIcon = document.getElementById('abs-icon');
    
    if (state === true) {
        yameteAudio.pause();
        yameteAudio.currentTime = 0; 
        yameteAudio.play().catch(e => console.error("Error playing audio (yamete):", e));
    } 

    if (seatbeltIcon) {
        seatbeltIcon.classList.toggle('active', state); 
    }
}

function setSpeedMode(mode) {
    speedMode = mode;
    switch(mode) {
        case 1: elements.speedMode.innerText = 'MPH'; break;
        case 2: elements.speedMode.innerText = 'Knots'; break;
        default: elements.speedMode.innerText = 'KMH';
    }
}


// =======================================================
// FUNGSI UTAMA PENGHUBUNG (NUI LISTENER)
// =======================================================

const updateUI = (data) => {
    const dashboardBox = document.getElementById('dashboard-box');
    let isVisible = dashboardBox.style.opacity === '1';
    const radioBox = document.getElementById('radio-box'); 

    // KONTROL VISIBILITAS TOTAL
    if (data.show !== undefined) {
        dashboardBox.style.opacity = data.show ? '1' : '0';
        if (radioBox) radioBox.style.opacity = data.show ? '1' : '0';
        dashboardBox.style.visibility = data.show ? 'visible' : 'hidden';
        if (radioBox) radioBox.style.visibility = data.show ? 'visible' : 'hidden';
        isVisible = data.show;
        if (!isVisible) {
            clearInterval(blinkInterval);
            lastIndicatorState = 0;
            stopRadio(); 
            return;
        }
    }
    if (!isVisible) return; 
    
    // DATA UTAMA (Dari Game/Lua)
    if (data.engine !== undefined) setEngine(data.engine);
    if (data.speed !== undefined) setSpeed(data.speed);
    // RPM tidak memiliki display khusus selain dots, tapi tetap update
    if (data.rpm !== undefined) elements.rpm.innerText = `${data.rpm.toFixed(4)} RPM`; 
    if (data.fuel !== undefined) setFuel(data.fuel);
    if (data.health !== undefined) setHealth(data.health);
    if (data.gear !== undefined) setGear(data.gear);
    if (data.headlights !== undefined) setHeadlights(data.headlights);
    if (data.seatbelts !== undefined) setSeatbelts(data.seatbelts); 
    if (data.speedMode !== undefined) setSpeedMode(data.speedMode);

    // INDICATORS
    if (data.leftIndicator !== undefined) setLeftIndicator(data.leftIndicator);
    if (data.rightIndicator !== undefined) setRightIndicator(data.rightIndicator);
};


// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // INISIALISASI ELEMENTS
    elements = {
        engine: document.getElementById('engine'),
        speed: document.getElementById('speed'),
        rpm: document.getElementById('rpm'), // Hidden
        fuel: document.getElementById('fuel'), // Hidden
        health: document.getElementById('health'), // Hidden
        gear: document.getElementById('gear'),
        headlights: document.getElementById('headlights'), // Hidden
        indicators: document.getElementById('indicators'), // Hidden
        seatbelts: document.getElementById('seatbelts'), // Hidden
        speedMode: document.getElementById('speed-mode'),
    };

    // Set nilai awal Radio
    updateRadioDisplay();

    // ===========================================
    // EVENT LISTENERS RADIO MANDIRI
    // ===========================================
    document.getElementById('play-pause-radio').addEventListener('click', togglePlayPause);
    document.getElementById('next-station').addEventListener('click', () => changeStation(1));
    document.getElementById('prev-station').addEventListener('click', () => changeStation(-1));

    // Menerima pesan dari game client (NUI Listener)
    window.addEventListener('message', (event) => {
        const data = event.data;
        if (data.type === 'speedoUpdate' || data.type === 'UPDATE_HUD_DATA') {
            updateUI(data.payload || data); 
        }
    });

    // Panggil updateUI sekali untuk nilai awal
    updateUI({ 
        speed: 0, 
        health: 1, 
        fuel: 0.87, 
        gear: 'R', 
        headlights: 0,
        engine: false,
        seatbelts: false, 
        leftIndicator: false, 
        rightIndicator: false,
        speedMode: 1, 
        show: true
    });
});
