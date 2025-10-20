// =======================================================
// VARIABEL GLOBAL & KONFIGURASI NUI
// =======================================================
let elements = {};
let speedMode = 1; 
let indicators = 0;
let isCustomHeadUnitVisible = false; 
let blinkInterval;
let lastIndicatorState = 0;

// ⚠️ TIDAK ADA RESOURCE_NAME KARENA TIDAK ADA FETCH/NUI CALLBACK KE LUA

// =======================================================
// FUNGSI KONTROL DASHBOARD (SETTER SPEDOMETER, DLL.)
// =======================================================

function setEngine(state) {
    const engineIcon = document.getElementById('engine-icon');
    if (engineIcon) engineIcon.classList.toggle('active', state);
}

function setSpeed(speed_ms) {
    // Logika konversi kecepatan tetap ada (MS ke MPH/Knots/KMH)
    let speedDisplay;
    switch(speedMode) {
        case 1: speedDisplay = Math.round(speed_ms * 2.236936); break; // MPH
        case 2: speedDisplay = Math.round(speed_ms * 1.943844); break; // Knots
        default: speedDisplay = Math.round(speed_ms * 3.6); // KMH
    }
    if (elements.speed) elements.speed.innerText = speedDisplay; 
    
    // Logika Power Bar
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
    const fuelFill = document.getElementById('fuel-fill');
    if (fuelFill) fuelFill.style.height = `${Math.round(fuel_100)}%`;
    if (fuelPercentElement) fuelPercentElement.textContent = `${Math.round(fuel_100)}%`; 
}

function setHealth(health_01) {
    const health_100 = Math.max(0, Math.min(100, health_01 * 100));
    const healthFill = document.getElementById('health-fill');
    const healthPercentElement = document.getElementById('health-percent');
    if (healthFill) {
        healthFill.style.height = `${Math.round(health_100)}%`;
        // Mengubah warna Health berdasarkan persentase
        healthFill.style.backgroundColor = health_100 < 30 ? '#ff0000' : (health_100 < 60 ? '#ffff00' : '#00ff00'); 
    }
    if (healthPercentElement) healthPercentElement.textContent = `${Math.round(health_100)}%`; 
}

function setGear(gear) {
    const gearElement = document.getElementById('gear');
    if (!gearElement) return;
    let displayGear = String(gear).toUpperCase();
    if (displayGear === '0') displayGear = 'N'; 
    if (displayGear.length > 1 && displayGear.match(/[A-Z]/i)) { 
        displayGear = displayGear[0];
    }
    gearElement.innerText = displayGear;
    gearElement.style.color = (displayGear === 'R' || displayGear === 'N') ? '#ff0000' : '#fff'; 
}

function setHeadlights(state) {
    const headlightsIcon = document.getElementById('headlights-icon');
    let displayOn = state === 1 || state === 2; 
    if (headlightsIcon) headlightsIcon.classList.toggle('active', displayOn);
}

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

function setSpeedMode(mode) {
    speedMode = mode;
    const speedModeElement = document.getElementById('speed-mode');
    if (!speedModeElement) return;
    speedModeElement.innerText = (mode === 1) ? 'MPH' : ((mode === 2) ? 'Knots' : 'KMH');
}

function toggleHeadUnitVisibility() {
    const button = document.getElementById('toggle-game-hud-button');
    const headUnitContainer = document.getElementById('custom-headunit-container'); 
    if (!headUnitContainer) return;

    isCustomHeadUnitVisible = !isCustomHeadUnitVisible;
    
    if (isCustomHeadUnitVisible) {
        button.classList.remove('hidden');
        headUnitContainer.style.display = 'flex'; 
    } else {
        button.classList.add('hidden');
        headUnitContainer.style.display = 'none'; 
    }
}


// =======================================================
// FUNGSI UTAMA PENGHUBUNG (NUI LISTENER)
// =======================================================

/**
 * Fungsi utama untuk menerima data dari client.lua FiveM dan mengupdate HUD.
 * Anda harus mengirim data ini dari client.lua menggunakan SendNuiMessage.
 */
const updateUI = (data) => {
    const dashboardBox = document.getElementById('dashboard-box');
    dashboardBox.style.opacity = '1'; 
    dashboardBox.style.visibility = 'visible'; 

    if (data.engine !== undefined) setEngine(data.engine);
    if (data.speed !== undefined) setSpeed(data.speed);
    if (data.fuel !== undefined) setFuel(data.fuel);
    if (data.health !== undefined) setHealth(data.health);
    if (data.gear !== undefined) setGear(data.gear);
    if (data.headlights !== undefined) setHeadlights(data.headlights); 
    if (data.seatbelts !== undefined) setSeatbelts(data.seatbelts); 
    if (data.speedMode !== undefined) setSpeedMode(data.speedMode);
    if (data.leftIndicator !== undefined) setLeftIndicator(data.leftIndicator);
    if (data.rightIndicator !== undefined) setRightIndicator(data.rightIndicator);
};

// Menerima pesan NUI dari Client-Side Lua
window.addEventListener('message', (event) => {
    const item = event.data;
    if (item.action === 'updateHUD') {
        updateUI(item.data);
    }
    if (item.action === 'toggleHeadUnit') {
        toggleHeadUnitVisibility();
    }
});


document.addEventListener('DOMContentLoaded', () => {
    // INISIALISASI ELEMENTS
    elements.speed = document.getElementById('speed'); 
    elements.gear = document.getElementById('gear');
    elements.speedMode = document.getElementById('speed-mode');


    const toggleGameHudButton = document.getElementById('toggle-game-hud-button');
    if (toggleGameHudButton) {
        toggleGameHudButton.addEventListener('click', toggleHeadUnitVisibility); 
    }
    
    // INISIALISASI STATUS AWAL HEAD UNIT (SEMBUNYI)
    const headUnitContainer = document.getElementById('custom-headunit-container');
    if (headUnitContainer) {
        headUnitContainer.style.display = 'none'; 
    }
    if (toggleGameHudButton) {
        toggleGameHudButton.classList.add('hidden');
    }

    // Panggil updateUI sekali untuk nilai awal (Demo)
    updateUI({ 
        speed: 0, health: 1, fuel: 0.87, gear: 'R', headlights: 0, engine: false, seatbelts: true, 
        leftIndicator: false, rightIndicator: false, speedMode: 1
    });
});
