// =======================================================
// VARIABEL GLOBAL DARI KODE ASLI ANDA
// =======================================================
let elements = {};
let speedMode = 1; 
let indicators = 0;

const onOrOff = state => state ? 'On' : 'Off';

// --- Fungsi Setter Asli Anda (Fokus perbaikan di Health dan Fuel) ---

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

/** * Mengupdate bar dan persentase bahan bakar.
 * PERBAIKAN: Menggunakan ID 'fuel-percent' untuk display teks
 */
function setFuel(fuel_01) {
    const fuel_100 = Math.max(0, Math.min(100, fuel_01 * 100));
    const fuelPercentElement = document.getElementById('fuel-percent');

    // 1. Memperbarui bar visual
    document.getElementById('fuel-fill').style.height = `${Math.round(fuel_100)}%`;
    
    // 2. MEMPERBARUI NILAI PERSENTASE DI BAGIAN ATAS (KINI MENGGUNAKAN ID INI)
    if (fuelPercentElement) {
        fuelPercentElement.textContent = `${Math.round(fuel_100)}%`; 
    }

    // 3. Memperbarui nilai mentah di elemen tersembunyi (ID lama Anda)
    elements.fuel.innerText = `${fuel_100.toFixed(1)}%`;
}

/** * Mengupdate bar dan persentase kesehatan.
 * PERBAIKAN: Menggunakan ID 'health-percent' untuk display teks
 */
function setHealth(health_01) {
    const health_100 = Math.max(0, Math.min(100, health_01 * 100));
    const healthFill = document.getElementById('health-fill');
    const healthPercentElement = document.getElementById('health-percent');
    
    // 1. Memperbarui bar visual
    if (healthFill) {
        healthFill.style.height = `${Math.round(health_100)}%`;
    }
    
    // 2. MEMPERBARUI NILAI PERSENTASE DI BAGIAN ATAS (KINI MENGGUNAKAN ID INI)
    if (healthPercentElement) {
        healthPercentElement.textContent = `${Math.round(health_100)}%`; 
    }
    
    // 3. Mengubah warna bar visual berdasarkan kesehatan
    if (healthFill) {
        if (health_100 < 30) {
            healthFill.style.backgroundColor = '#ff0000'; 
        } else if (health_100 < 60) {
            healthFill.style.backgroundColor = '#ffff00'; 
        } else {
            healthFill.style.backgroundColor = '#00ff00'; 
        }
    }

    // 4. Memperbarui nilai mentah di elemen tersembunyi (ID lama Anda)
    elements.health.innerText = `${health_100.toFixed(1)}%`;
}

// ... (Fungsi setGear, setHeadlights, controlIndicators, setLeftIndicator, setRightIndicator, setSeatbelts, setSpeedMode sama) ...


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

    // 3. INDICATORS
    if (data.leftIndicator !== undefined) setLeftIndicator(data.leftIndicator);
    if (data.rightIndicator !== undefined) setRightIndicator(data.rightIndicator);
};


// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // PENTING: Inisialisasi 'elements' untuk menangkap semua ID yang ada
    elements = {
        // ID lama (untuk nilai mentah di div tersembunyi)
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
        
        // ID baru (untuk elemen visual)
        'dashboard-box': document.getElementById('dashboard-box'),
        'health-fill': document.getElementById('health-fill'),
        'fuel-fill': document.getElementById('fuel-fill'),
        'health-percent': document.getElementById('health-percent'), // PENTING: ID Persentase Baru
        'fuel-percent': document.getElementById('fuel-percent'),   // PENTING: ID Persentase Baru
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
