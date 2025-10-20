// =======================================================
// VARIABEL GLOBAL
// =======================================================
let elements = {};
let speedMode = 1; 
let indicators = 0;

const onOrOff = state => state ? 'On' : 'Off';

// =======================================================
// FUNGSI SETTER
// =======================================================

/** Mengupdate status mesin dan mengaktifkan ikon. */
function setEngine(state) {
    document.getElementById('engine-icon').classList.toggle('active', state);
    elements.engine.innerText = onOrOff(state); 
}

/** Mengupdate kecepatan dan unit display. */
function setSpeed(speed_ms) {
    let speedDisplay;
    switch(speedMode) {
        case 1: speedDisplay = Math.round(speed_ms * 2.236936); break; // MPH
        case 2: speedDisplay = Math.round(speed_ms * 1.943844); break; // Knots
        default: speedDisplay = Math.round(speed_ms * 3.6); // KMH
    }
    elements.speed.innerText = speedDisplay; 
    
    // Logic Power Dots/RPM visual
    const maxDots = 4;
    let scaleMax = speedMode === 1 ? 120 : 180; 
    let powerLevel = Math.min(maxDots, Math.ceil(speedDisplay / (scaleMax / maxDots))); 
    const powerDots = document.querySelectorAll('.power-bar-dots .dot');
    powerDots.forEach((dot, index) => {
        dot.classList.toggle('active', index < powerLevel);
    });
}

/** Mengupdate RPM mentah (dipertahankan) */
function setRPM(rpm) {
    elements.rpm.innerText = `${rpm.toFixed(4)} RPM`;
}

/** Mengupdate bar dan persentase bahan bakar. */
function setFuel(fuel_01) {
    const fuel_100 = Math.max(0, Math.min(100, fuel_01 * 100));
    const fuelPercentElement = document.getElementById('fuel-percent');

    // Memperbarui bar visual
    document.getElementById('fuel-fill').style.height = `${Math.round(fuel_100)}%`;
    
    // Memperbarui nilai persentase di bagian atas
    if (fuelPercentElement) {
        fuelPercentElement.textContent = `${Math.round(fuel_100)}%`; 
    }

    // Memperbarui nilai mentah di elemen tersembunyi
    elements.fuel.innerText = `${fuel_100.toFixed(1)}%`;
}

/** Mengupdate bar dan persentase kesehatan. */
function setHealth(health_01) {
    const health_100 = Math.max(0, Math.min(100, health_01 * 100));
    const healthFill = document.getElementById('health-fill');
    const healthPercentElement = document.getElementById('health-percent');
    
    // Memperbarui bar visual
    if (healthFill) {
        healthFill.style.height = `${Math.round(health_100)}%`;
    }
    
    // Memperbarui nilai persentase di bagian atas
    if (healthPercentElement) {
        healthPercentElement.textContent = `${Math.round(health_100)}%`; 
    }
    
    // Mengubah warna bar visual berdasarkan kesehatan
    if (healthFill) {
        if (health_100 < 30) {
            healthFill.style.backgroundColor = '#ff0000'; 
        } else if (health_100 < 60) {
            healthFill.style.backgroundColor = '#ffff00'; 
        } else {
            healthFill.style.backgroundColor = '#00ff00'; 
        }
    }

    // Memperbarui nilai mentah di elemen tersembunyi
    elements.health.innerText = `${health_100.toFixed(1)}%`;
}

/** Mengupdate display gear. (FIXED) */
function setGear(gear) {
    // Memastikan elemen 'gear' visual telah ditemukan
    const gearElement = document.getElementById('gear');
    if (!gearElement) return;

    let displayGear = String(gear).toUpperCase();
    
    // Logika untuk mengubah '0' menjadi 'N'
    if (displayGear === '0') {
        displayGear = 'N'; 
    } 
    
    // Memperbarui display gear
    gearElement.innerText = displayGear;
    
    // Mengubah warna: Merah untuk R/N, Putih untuk gigi maju
    gearElement.style.color = (displayGear === 'R' || displayGear === 'N') ? '#ff0000' : '#fff'; 
    
    // Memperbarui nilai mentah (jika elemen tersembunyi ada)
    if (elements.gear) {
        elements.gear.innerText = displayGear;
    }
}


/** Mengupdate status Headlights dan ikon. */
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

        if (state === 1) { // Kiri
            blinkInterval = setInterval(() => { turnLeft.classList.toggle('active'); }, 250);
        } else if (state === 2) { // Kanan
            blinkInterval = setInterval(() => { turnRight.classList.toggle('active'); }, 250);
        } else if (state === 3) { // Hazard
             blinkInterval = setInterval(() => { 
                turnLeft.classList.toggle('active');
                turnRight.classList.toggle('active');
             }, 250);
        }
    }
    lastIndicatorState = state;
}

/** Mengupdate status Sein Kiri */
function setLeftIndicator(state) {
    indicators = (indicators & 0b10) | (state ? 0b01 : 0b00);
    controlIndicators(indicators);
    elements.indicators.innerText = `${indicators & 0b01 ? 'On' : 'Off'} / ${indicators & 0b10 ? 'On' : 'Off'}`;
}

/** Mengupdate status Sein Kanan */
function setRightIndicator(state) {
    indicators = (indicators & 0b01) | (state ? 0b10 : 0b00);
    controlIndicators(indicators);
    elements.indicators.innerText = `${indicators & 0b01 ? 'On' : 'Off'} / ${indicators & 0b10 ? 'On' : 'Off'}`;
}

/** Mengupdate status Seatbelts */
function setSeatbelts(state) {
    elements.seatbelts.innerText = onOrOff(state);
}

/** Mengupdate mode kecepatan (MPH/KMH/Knots) */
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

    // 1. KONTROL VISIBILITAS TOTAL
    if (data.show !== undefined) {
        dashboardBox.style.opacity = data.show ? '1' : '0';
        dashboardBox.style.visibility = data.show ? 'visible' : 'hidden';
        isVisible = data.show;
        if (!isVisible) {
            clearInterval(blinkInterval);
            lastIndicatorState = 0;
            return;
        }
    }
    if (!isVisible) return; 
    
    // 2. DATA UTAMA
    if (data.engine !== undefined) setEngine(data.engine);
    if (data.speed !== undefined) setSpeed(data.speed);
    if (data.rpm !== undefined) setRPM(data.rpm);
    if (data.fuel !== undefined) setFuel(data.fuel);
    if (data.health !== undefined) setHealth(data.health);
    if (data.gear !== undefined) setGear(data.gear); // <--- PASTIKAN INI TERPANGGIL
    if (data.headlights !== undefined) setHeadlights(data.headlights);
    if (data.seatbelts !== undefined) setSeatbelts(data.seatbelts);
    if (data.speedMode !== undefined) setSpeedMode(data.speedMode);

    // 3. INDICATORS
    if (data.leftIndicator !== undefined) setLeftIndicator(data.leftIndicator);
    if (data.rightIndicator !== undefined) setRightIndicator(data.rightIndicator);
};


// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // PENTING: Inisialisasi 'elements' untuk semua elemen tersembunyi dan visual
    elements = {
        // ID TERSEMBUNYI
        engine: document.getElementById('engine'),
        speed: document.getElementById('speed'),
        rpm: document.getElementById('rpm'),
        fuel: document.getElementById('fuel'),
        health: document.getElementById('health'),
        gear: document.getElementById('gear'), // GEAR UNTUK NILAI MENTAH (di div tersembunyi)
        headlights: document.getElementById('headlights'),
        indicators: document.getElementById('indicators'),
        seatbelts: document.getElementById('seatbelts'),
        speedMode: document.getElementById('speed-mode'),
        
        // ID VISUAL
        'dashboard-box': document.getElementById('dashboard-box'),
        'health-fill': document.getElementById('health-fill'),
        'fuel-fill': document.getElementById('fuel-fill'),
        'health-percent': document.getElementById('health-percent'),
        'fuel-percent': document.getElementById('fuel-percent'),
        'turn-left-icon': document.getElementById('turn-left-icon'),
        'turn-right-icon': document.getElementById('turn-right-icon'),
    };

    // Menerima pesan dari game client
    window.addEventListener('message', (event) => {
        const data = event.data;
        if (data.type === 'speedoUpdate' || data.type === 'UPDATE_HUD_DATA') {
            updateUI(data.payload || data); 
        }
    });

    // Panggil updateUI sekali untuk nilai awal (R)
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
