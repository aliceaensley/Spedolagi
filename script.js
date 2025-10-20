// =======================================================
// VARIABEL GLOBAL
// =======================================================
let elements = {};
let speedMode = 1; 
let indicators = 0;
let isHeadUnitVisible = true; // Status awal Head Unit Game

const onOrOff = state => state ? 'On' : 'Off';

// =======================================================
// FUNGSI SETTER (DASHBOARD KUSTOM - SAMA PERSIS)
// =======================================================

function setEngine(state) {
    document.getElementById('engine-icon').classList.toggle('active', state);
    elements.engine.innerText = onOrOff(state); 
}

// ... (Semua fungsi setSpeed, setRPM, setFuel, setHealth, setGear, setHeadlights, controlIndicators, setLeftIndicator, setRightIndicator, setSeatbelts, setSpeedMode SAMA PERSIS) ...

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
        if (health_100 < 30) {
            healthFill.style.backgroundColor = '#ff0000'; 
        } else if (health_100 < 60) {
            healthFill.style.backgroundColor = '#ffff00'; 
        } else {
            healthFill.style.backgroundColor = '#00ff00'; 
        }
    }
    if (healthPercentElement) {
        healthPercentElement.textContent = `${Math.round(health_100)}%`; 
    }
    elements.health.innerText = `${health_100.toFixed(1)}%`;
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
        if (state === 1) { blinkInterval = setInterval(() => { turnLeft.classList.toggle('active'); }, 250);
        } else if (state === 2) { blinkInterval = setInterval(() => { turnRight.classList.toggle('active'); }, 250);
        } else if (state === 3) { blinkInterval = setInterval(() => { turnLeft.classList.toggle('active'); turnRight.classList.toggle('active'); }, 250);
        }
    }
    lastIndicatorState = state;
}

function setSeatbelts(state) {
    const seatbeltIcon = document.getElementById('abs-icon');
    if (seatbeltIcon) {
        seatbeltIcon.classList.toggle('active', state); 
    }
    elements.seatbelts.innerText = onOrOff(state);
}

// =======================================================
// FUNGSI BARU: KONTROL VISIBILITAS HEAD UNIT GAME
// =======================================================

function toggleHeadUnitVisibility() {
    const button = document.getElementById('toggle-game-hud-button');
    
    isHeadUnitVisible = !isHeadUnitVisible;
    
    if (isHeadUnitVisible) {
        button.classList.remove('hidden');
        // Mengirim pesan NUI show: true (MENAMPILKAN Head Unit Bawaan Game)
        fetch('https://nama_resource_anda/toggleHeadUnit', { // GANTI nama_resource_anda
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8', },
            body: JSON.stringify({ show: true }),
        });
    } else {
        button.classList.add('hidden');
        // Mengirim pesan NUI show: false (MENYEMBUNYIKAN Head Unit Bawaan Game)
        fetch('https://nama_resource_anda/toggleHeadUnit', { // GANTI nama_resource_anda
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8', },
            body: JSON.stringify({ show: false }),
        });
    }
}


// =======================================================
// FUNGSI UTAMA PENGHUBUNG (NUI LISTENER)
// =======================================================

const updateUI = (data) => {
    // BARIS PENTING: DASHBOARD KUSTOM ANDA SELALU TERLIHAT
    const dashboardBox = document.getElementById('dashboard-box');
    dashboardBox.style.opacity = '1'; 
    dashboardBox.style.visibility = 'visible'; 
    // ^^^ Ini memastikan HUD Anda tidak pernah disembunyikan oleh tombol baru.

    // DATA UTAMA
    if (data.engine !== undefined) setEngine(data.engine);
    if (data.speed !== undefined) setSpeed(data.speed);
    if (data.fuel !== undefined) setFuel(data.fuel);
    if (data.health !== undefined) setHealth(data.health);
    // ... (pemanggilan setter data lain) ...

    if (data.seatbelts !== undefined) setSeatbelts(data.seatbelts);
    
    // Sinkronisasi status Head Unit jika ada event dari game
    if (data.showHeadUnit !== undefined && data.showHeadUnit !== isHeadUnitVisible) {
        toggleHeadUnitVisibility();
    }
};


document.addEventListener('DOMContentLoaded', () => {
    // INISIALISASI ELEMENTS
    elements = {
        engine: document.getElementById('engine'), speed: document.getElementById('speed'), 
        // ... (inisialisasi elemen lain) ...
        'dashboard-box': document.getElementById('dashboard-box'), 
    };

    // EVENT LISTENER UNTUK TOMBOL HEAD UNIT
    const toggleGameHudButton = document.getElementById('toggle-game-hud-button');
    if (toggleGameHudButton) {
        toggleGameHudButton.addEventListener('click', toggleHeadUnitVisibility); 
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
