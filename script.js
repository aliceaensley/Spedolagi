// =======================================================
// VARIABEL GLOBAL
// =======================================================
let elements = {};
let speedMode = 1; 
let indicators = 0;
let isCustomHeadUnitVisible = false; // <<< INI PERUBAHAN PENTING: DEFAULT KE FALSE (TERSEMBUNYI)
let blinkInterval;
let lastIndicatorState = 0;

const onOrOff = state => state ? 'On' : 'Off';

// =======================================================
// FUNGSI SETTER (SPEEDOMETER)
// =======================================================

function setEngine(state) {
    const engineIcon = document.getElementById('engine-icon');
    if (engineIcon) engineIcon.classList.toggle('active', state);
}
// ... (setSpeed, setFuel, setHealth, setGear, setSpeedMode, dll. SAMA) ...

function setHeadlights(state) {
    const headlightsIcon = document.getElementById('headlights-icon');
    let displayOn = state === 1 || state === 2;
    if (headlightsIcon) headlightsIcon.classList.toggle('active', displayOn);
}

// LOGIKA SEIN/INDIKATOR (SAMA)
function controlIndicators(state) {
    const turnLeft = document.getElementById('turn-left-icon'); 
    const turnRight = document.getElementById('turn-right-icon'); 

    if (state !== lastIndicatorState) {
        clearInterval(blinkInterval);
        if (turnLeft) turnLeft.classList.remove('active');
        if (turnRight) turnRight.classList.remove('active');

        if (state === 1) { // Kiri
            blinkInterval = setInterval(() => { if(turnLeft) turnLeft.classList.toggle('active'); }, 250);
        } else if (state === 2) { // Kanan
            blinkInterval = setInterval(() => { if(turnRight) turnRight.classList.toggle('active'); }, 250);
        } else if (state === 3) { // Hazard
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
    if (seatbeltIcon) seatbeltIcon.classList.toggle('active', state); 
}

// ... (setRPM, setFuel, setHealth, setGear, setSpeedMode - Anda harus menambahkannya) ...

// =======================================================
// FUNGSI KONTROL HEAD UNIT TAMBAHAN
// =======================================================

function toggleHeadUnitVisibility() {
    const button = document.getElementById('toggle-game-hud-button');
    const headUnitContainer = document.getElementById('custom-headunit-container'); 

    if (!headUnitContainer) return;

    isCustomHeadUnitVisible = !isCustomHeadUnitVisible;
    
    if (isCustomHeadUnitVisible) {
        button.classList.remove('hidden');
        headUnitContainer.style.display = 'flex'; // TAMPILKAN
    } else {
        button.classList.add('hidden');
        headUnitContainer.style.display = 'none'; // SEMBUNYIKAN
    }
}


// =======================================================
// FUNGSI UTAMA PENGHUBUNG (NUI LISTENER)
// =======================================================

const updateUI = (data) => {
    // Memastikan dashboard selalu terlihat
    const dashboardBox = document.getElementById('dashboard-box');
    dashboardBox.style.opacity = '1'; 
    dashboardBox.style.visibility = 'visible'; 

    if (data.engine !== undefined) setEngine(data.engine);
    if (data.speed !== undefined) setSpeed(data.speed);
    // ... panggil setter lain di sini ...
    if (data.headlights !== undefined) setHeadlights(data.headlights); 
    if (data.seatbelts !== undefined) setSeatbelts(data.seatbelts); 
    if (data.leftIndicator !== undefined) setLeftIndicator(data.leftIndicator);
    if (data.rightIndicator !== undefined) setRightIndicator(data.rightIndicator);
};


document.addEventListener('DOMContentLoaded', () => {
    // INISIALISASI ELEMENTS (Hanya yang digunakan oleh setSpeed, dll.)
    elements.speed = document.getElementById('speed'); 
    elements.gear = document.getElementById('gear');
    elements.speedMode = document.getElementById('speed-mode');


    const toggleGameHudButton = document.getElementById('toggle-game-hud-button');
    if (toggleGameHudButton) {
        toggleGameHudButton.addEventListener('click', toggleHeadUnitVisibility); 
    }
    
    // PERBAIKAN: INISIALISASI STATUS AWAL HEAD UNIT TAMBAHAN (SEMBUNYI)
    const headUnitContainer = document.getElementById('custom-headunit-container');
    if (headUnitContainer) {
        // Karena isCustomHeadUnitVisible = false, Head Unit harus disembunyikan
        headUnitContainer.style.display = 'none'; 
    }
    // Karena isCustomHeadUnitVisible = false, tombol harus dalam state 'hidden' (merah)
    if (toggleGameHudButton) {
        toggleGameHudButton.classList.add('hidden');
    }

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
