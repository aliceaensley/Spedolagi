// =======================================================
// VARIABEL GLOBAL
// =======================================================
let elements = {};
let speedMode = 1; 
let indicators = 0;
let isHeadUnitVisible = true; // Status awal Head Unit Game

const onOrOff = state => state ? 'On' : 'Off';

// =======================================================
// FUNGSI SETTER (Semua sama seperti versi final sebelumnya)
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

function setRPM(rpm) {
    elements.rpm.innerText = `${rpm.toFixed(4)} RPM`;
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
    
    if (elements.gear) {
        elements.gear.innerText = displayGear;
    }
}

function setHeadlights(state) {
    let display = 'Off';
    if (state === 1 || state === 2) display = 'On';

    document.getElementById('headlights-icon').classList.toggle('active', display !== 'Off');

    switch(state) {
        case 1: elements.headlights.innerText = 'On'; break;
        case 2: elements.headlights.innerText = 'High Beam'; break;
        default: elements.headlights.innerText = 'Off';
    }
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
    elements.indicators.innerText = `${indicators & 0b01 ? 'On' : 'Off'} / ${indicators & 0b10 ? 'On' : 'Off'}`;
}

function setRightIndicator(state) {
    indicators = (indicators & 0b01) | (state ? 0b10 : 0b00);
    controlIndicators(indicators);
    elements.indicators.innerText = `${indicators & 0b01 ? 'On' : 'Off'} / ${indicators & 0b10 ? 'On' : 'Off'}`;
}

function setSeatbelts(state) {
    const seatbeltIcon = document.getElementById('abs-icon');
    
    if (seatbeltIcon) {
        seatbeltIcon.classList.toggle('active', state); // Menyala saat TRUE (terpasang)
    }

    elements.seatbelts.innerText = onOrOff(state);
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
// FUNGSI BARU: KONTROL VISIBILITAS HEAD UNIT GAME (LAYAR TENGAH)
// =======================================================

function toggleHeadUnitVisibility() {
    const button = document.getElementById('toggle-game-hud-button');
    
    isHeadUnitVisible = !isHeadUnitVisible;
    
    if (isHeadUnitVisible) {
        button.textContent = '[—] Head Unit';
        button.classList.remove('hidden');
        // Mengirim pesan ke game untuk MENAMPILKAN HEAD UNIT
        fetch('https://nama_resource_anda/toggleHeadUnit', { // GANTI nama_resource_anda
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8', },
            body: JSON.stringify({ show: true }),
        });
    } else {
        button.textContent = '[+] Head Unit';
        button.classList.add('hidden');
        // Mengirim pesan ke game untuk MENYEMBUNYIKAN HEAD UNIT
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

    // DATA UTAMA
    if (data.engine !== undefined) setEngine(data.engine);
    if (data.speed !== undefined) setSpeed(data.speed);
    if (data.rpm !== undefined) setRPM(data.rpm);
    if (data.fuel !== undefined) setFuel(data.fuel);
    if (data.health !== undefined) setHealth(data.health);
    if (data.gear !== undefined) setGear(data.gear);
    if (data.headlights !== undefined) setHeadlights(data.headlights);
    if (data.seatbelts !== undefined) setSeatbelts(data.seatbelts);
    if (data.speedMode !== undefined) setSpeedMode(data.speedMode);

    // INDICATORS
    if (data.leftIndicator !== undefined) setLeftIndicator(data.leftIndicator);
    if (data.rightIndicator !== undefined) setRightIndicator(data.rightIndicator);
    
    // Logika NUI bawaan (data.show) kini bisa digunakan untuk sinkronisasi Head Unit
    if (data.show !== undefined && data.show !== isHeadUnitVisible) {
        toggleHeadUnitVisibility();
    }
};


// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // INISIALISASI ELEMENTS
    elements = {
        // ... (inisialisasi elemen sama) ...
    };

    // PENTING: EVENT LISTENER UNTUK TOMBOL HEAD UNIT
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
        leftIndicator: false, rightIndicator: false, speedMode: 1, show: true 
    });
});
