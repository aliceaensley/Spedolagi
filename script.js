// =======================================================
// VARIABEL GLOBAL DARI KODE ASLI ANDA
// =======================================================
let elements = {};
let speedMode = 1; // Default MPH
let indicators = 0;

const onOrOff = state => state ? 'On' : 'Off';

// --- Fungsi Setter Asli Anda (Memodifikasi logika visualnya) ---

/** Mengupdate status mesin dan mengaktifkan ikon. */
function setEngine(state) {
    // Memperbarui ikon mesin di HUD visual
    document.getElementById('engine-icon').classList.toggle('active', state);
    // Memperbarui nilai mentah di elemen tersembunyi (jika diperlukan oleh skrip game)
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
    
    // Memperbarui angka kecepatan (ID speed)
    elements.speed.innerText = speedDisplay; 
    
    // Mengupdate Power Dots (RPM/Power Level) berdasarkan kecepatan
    const maxDots = 4;
    let scaleMax = speedMode === 1 ? 120 : 180; 
    let powerLevel = Math.min(maxDots, Math.ceil(speedDisplay / (scaleMax / maxDots))); 
    const powerDots = document.querySelectorAll('.power-bar-dots .dot');
    powerDots.forEach((dot, index) => {
        dot.classList.toggle('active', index < powerLevel);
    });
}

/** Mengupdate RPM mentah (tidak digunakan di visual kita, tapi dipertahankan) */
function setRPM(rpm) {
    elements.rpm.innerText = `${rpm.toFixed(4)} RPM`;
}

/** Mengupdate bar dan persentase bahan bakar. */
function setFuel(fuel_01) {
    const fuel_100 = Math.max(0, Math.min(100, fuel_01 * 100));

    // Memperbarui bar visual
    document.getElementById('fuel-fill').style.height = `${Math.round(fuel_100)}%`;
    document.getElementById('fuel-percent').textContent = `${Math.round(fuel_100)}%`;

    // Memperbarui nilai mentah di elemen tersembunyi
    elements.fuel.innerText = `${fuel_100.toFixed(1)}%`;
}

/** Mengupdate bar dan persentase kesehatan. */
function setHealth(health_01) {
    const health_100 = Math.max(0, Math.min(100, health_01 * 100));
    
    // Memperbarui bar visual
    const healthFill = document.getElementById('health-fill');
    healthFill.style.height = `${Math.round(health_100)}%`;
    document.getElementById('health-percent').textContent = `${Math.round(health_100)}%`;
    
    // Mengubah warna bar visual berdasarkan kesehatan
    if (health_100 < 30) {
        healthFill.style.backgroundColor = '#ff0000'; 
    } else if (health_100 < 60) {
        healthFill.style.backgroundColor = '#ffff00'; 
    } else {
        healthFill.style.backgroundColor = '#00ff00'; 
    }

    // Memperbarui nilai mentah di elemen tersembunyi
    elements.health.innerText = `${health_100.toFixed(1)}%`;
}

/** Mengupdate display gear. */
function setGear(gear) {
    let displayGear = String(gear).toUpperCase();
    if (displayGear === '0') displayGear = 'R'; 
    
    // Memperbarui display gear (ID gear)
    elements.gear.innerText = displayGear;
    elements.gear.style.color = (displayGear === 'R' || displayGear === 'N') ? '#ff0000' : '#fff'; 
}

/** Mengupdate status Headlights dan ikon. */
function setHeadlights(state) {
    let display = 'Off';
    if (state === 1 || state === 2) display = 'On';

    // Memperbarui ikon lampu visual
    document.getElementById('headlights-icon').classList.toggle('active', display !== 'Off');

    // Memperbarui nilai mentah di elemen tersembunyi
    switch(state) {
        case 1: elements.headlights.innerText = 'On'; break;
        case 2: elements.headlights.innerText = 'High Beam'; break;
        default: elements.headlights.innerText = 'Off';
    }
}

// Global state untuk mengelola interval sein
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
    // Memperbarui ikon visual
    controlIndicators(indicators);
    // Memperbarui nilai mentah di elemen tersembunyi
    elements.indicators.innerText = `${indicators & 0b01 ? 'On' : 'Off'} / ${indicators & 0b10 ? 'On' : 'Off'}`;
}

/** Mengupdate status Sein Kanan */
function setRightIndicator(state) {
    indicators = (indicators & 0b01) | (state ? 0b10 : 0b00);
    // Memperbarui ikon visual
    controlIndicators(indicators);
    // Memperbarui nilai mentah di elemen tersembunyi
    elements.indicators.innerText = `${indicators & 0b01 ? 'On' : 'Off'} / ${indicators & 0b10 ? 'On' : 'Off'}`;
}

/** Mengupdate status Seatbelts */
function setSeatbelts(state) {
    // Seatbelts tidak memiliki ikon di visual kita, hanya update nilai mentah
    elements.seatbelts.innerText = onOrOff(state);
}

/** Mengupdate mode kecepatan (MPH/KMH/Knots) */
function setSpeedMode(mode) {
    speedMode = mode;
    // Memperbarui display unit (ID speed-mode)
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
    
    // 2. DATA UTAMA (Memanggil fungsi setter asli Anda)
    if (data.engine !== undefined) setEngine(data.engine);
    if (data.speed !== undefined) setSpeed(data.speed);
    if (data.rpm !== undefined) setRPM(data.rpm);
    if (data.fuel !== undefined) setFuel(data.fuel);
    if (data.health !== undefined) setHealth(data.health);
    if (data.gear !== undefined) setGear(data.gear);
    if (data.headlights !== undefined) setHeadlights(data.headlights);
    if (data.seatbelts !== undefined) setSeatbelts(data.seatbelts);
    if (data.speedMode !== undefined) setSpeedMode(data.speedMode);

    // 3. INDICATORS (Memanggil setter Sein Kiri/Kanan asli Anda)
    if (data.leftIndicator !== undefined) setLeftIndicator(data.leftIndicator);
    if (data.rightIndicator !== undefined) setRightIndicator(data.rightIndicator);
};


// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi 'elements' agar semua fungsi setter asli Anda bekerja
    elements = {
        engine: document.getElementById('engine'),
        speed: document.getElementById('speed'),
        rpm: document.getElementById('rpm'),
        fuel: document.getElementById('fuel'),
        health: document.getElementById('health'),
        gear: document.getElementById('gear'),
        headlights: document.getElementById('headlights'),
        indicators: document.getElementById('indicators'),
        seatbelts: document.getElementById('seatbelts'),
        speedMode: document.getElementById('speed-mode'),
        // Tambahkan elemen visual yang digunakan di fungsi setter
        'dashboard-box': document.getElementById('dashboard-box'),
        'health-fill': document.getElementById('health-fill'),
        'fuel-fill': document.getElementById('fuel-fill'),
    };

    // Menerima pesan dari game client
    window.addEventListener('message', (event) => {
        const data = event.data;
        // Asumsi event yang dikirim game adalah 'speedoUpdate' atau 'UPDATE_HUD_DATA'
        if (data.type === 'speedoUpdate' || data.type === 'UPDATE_HUD_DATA') {
            updateUI(data.payload || data); 
        }
    });

    // Panggil updateUI sekali untuk memastikan nilai awal diatur saat HUD dimuat di game.
    updateUI({ 
        speed: 0, 
        health: 1, 
        fuel: 0.87, // 87%
        gear: 'R', 
        headlights: 0,
        engine: false,
        seatbelts: false,
        leftIndicator: false, 
        rightIndicator: false,
        speedMode: 1, // MPH
        show: true
    });
});
