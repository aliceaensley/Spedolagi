// =======================================================
// VARIABEL GLOBAL
// =======================================================
let elements = {};
let speedMode = 1; 
let indicators = 0;
let isCustomHeadUnitVisible = true; // Mengontrol Head Unit Tambahan
let blinkInterval;
let lastIndicatorState = 0;

const onOrOff = state => state ? 'On' : 'Off';

// =======================================================
// FUNGSI SETTER (DASHBOARD KUSTOM)
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

// ... (setRPM, setFuel, setHealth, setGear, setSpeedMode SAMA) ...
// (Fungsi-fungsi di atas dihilangkan untuk keringkasan, tetapi diasumsikan ada dan berfungsi)

function setHeadlights(state) {
    const headlightsIcon = document.getElementById('headlights-icon');
    let display = 'Off';
    if (state === 1 || state === 2) display = 'On';

    if (headlightsIcon) {
        headlightsIcon.classList.toggle('active', display !== 'Off');
    }
}

// PERBAIKAN LOGIKA SEIN/INDIKATOR
function controlIndicators(state) {
    const turnLeft = document.getElementById('turn-left-icon'); 
    const turnRight = document.getElementById('turn-right-icon'); 

    if (state !== lastIndicatorState) {
        clearInterval(blinkInterval);
        
        // Memastikan ikon dinonaktifkan
        if (turnLeft) turnLeft.classList.remove('active');
        if (turnRight) turnRight.classList.remove('active');

        if (state === 1) { // Kiri
            blinkInterval = setInterval(() => { if(turnLeft) turnLeft.classList.toggle('active'); }, 250);
        } else if (state === 2) { // Kanan
            blinkInterval = setInterval(() => { if(turnRight) turnRight.classList.toggle('active'); }, 250);
        } else if (state === 3) { // Hazard (1 + 2)
             blinkInterval = setInterval(() => { 
                if(turnLeft) turnLeft.classList.toggle('active');
                if(turnRight) turnRight.classList.toggle('active');
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
    
    if (seatbeltIcon) {
        seatbeltIcon.classList.toggle('active', state); 
    }
}

// =======================================================
// FUNGSI KONTROL HEAD UNIT TAMBAHAN (DARI HTML/JS)
// =======================================================

function toggleHeadUnitVisibility() {
    const button = document.getElementById('toggle-game-hud-button');
    const headUnitContainer = document.getElementById('custom-headunit-container'); 

    if (!headUnitContainer) {
        // console.error("Elemen 'custom-headunit-container' tidak ditemukan!");
        return;
    }

    isCustomHeadUnitVisible = !isCustomHeadUnitVisible;
    
    if (isCustomHeadUnitVisible) {
        button.classList.remove('hidden');
        // MENAMPILKAN Head Unit Tambahan Anda
        headUnitContainer.style.display = 'block'; 
    } else {
        button.classList.add('hidden');
        // MENYEMBUNYIKAN Head Unit Tambahan Anda
        headUnitContainer.style.display = 'none'; 
    }
    
    // TIDAK ADA FETCH NUI LAGI
}


// =======================================================
// FUNGSI UTAMA PENGHUBUNG (NUI LISTENER)
// =======================================================

const updateUI = (data) => {
    // MEMASTIKAN DASHBOARD KUSTOM SELALU TERLIHAT
    const dashboardBox = document.getElementById('dashboard-box');
    dashboardBox.style.opacity = '1'; 
    dashboardBox.style.visibility = 'visible'; 

    // DATA UTAMA
    if (data.engine !== undefined) setEngine(data.engine);
    if (data.speed !== undefined) setSpeed(data.speed);
    // ... (pemanggilan setter data lain) ...
    if (data.headlights !== undefined) setHeadlights(data.headlights); 
    if (data.seatbelts !== undefined) setSeatbelts(data.seatbelts); 

    // INDIKATOR
    if (data.leftIndicator !== undefined) setLeftIndicator(data.leftIndicator);
    if (data.rightIndicator !== undefined) setRightIndicator(data.rightIndicator);
};


document.addEventListener('DOMContentLoaded', () => {
    // INISIALISASI ELEMENTS
    // (Inisialisasi di sini)
    
    // EVENT LISTENER UNTUK TOMBOL HEAD UNIT
    const toggleGameHudButton = document.getElementById('toggle-game-hud-button');
    if (toggleGameHudButton) {
        toggleGameHudButton.addEventListener('click', toggleHeadUnitVisibility); 
    }
    
    // INISIALISASI STATUS AWAL HEAD UNIT TAMBAHAN
    // Agar status awal 'isCustomHeadUnitVisible = true' terimplementasi
    const headUnitContainer = document.getElementById('custom-headunit-container');
    if (headUnitContainer) {
        headUnitContainer.style.display = 'block'; 
    }

    // Menerima pesan dari game client
    window.addEventListener('message', (event) => {
        const data = event.data;
        if (data.type === 'speedoUpdate' || data.type === 'UPDATE_HUD_DATA') {
            updateUI(data.payload || data); 
        }
    });

    // Panggil updateUI sekali untuk nilai awal
    updateUI({ 
        speed: 0, health: 1, fuel: 0.87, gear: 'R', headlights: 0, engine: false, seatbelts: true, 
        leftIndicator: false, rightIndicator: false, speedMode: 1
    });
});
