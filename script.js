// =======================================================
// VARIABEL GLOBAL & KONFIGURASI
// =======================================================
let elements = {};
let speedMode = 1; // Default MPH (Sesuai Screenshot)
let indicators = 0;
let blinkInterval;
let lastIndicatorState = 0;
let isSimulationRunning = false; 

// =======================================================
// FUNGSI KONTROL DASHBOARD (SETTER)
// =======================================================

/**
 * Memperbarui tampilan ikon mesin (Engine).
 * @param {boolean} state Jika true, mesin menyala; sebaliknya mati.
 */
function setEngine(state) {
    const engineIcon = document.getElementById('engine-icon');
    if (engineIcon) engineIcon.classList.toggle('active', state);
}

/**
 * Memperbarui tampilan kecepatan dan mode unit.
 * @param {number} speed_ms Nilai kecepatan dalam meter per detik (m/s).
 */
function setSpeed(speed_ms) {
    let speedDisplay;
    // Logika konversi tetap sama dari kode asli Anda
    switch(speedMode) {
        case 1: speedDisplay = Math.round(speed_ms * 2.236936); break; // MPH
        case 2: speedDisplay = Math.round(speed_ms * 1.943844); break; // Knots
        default: speedDisplay = Math.round(speed_ms * 3.6); // KMH
    }
    if (elements.speed) elements.speed.innerText = speedDisplay; 
}

/**
 * Memperbarui RPM Bar (mengganti RPM numerik dengan visual bar titik).
 * @param {number} rpm_01 Nilai RPM dari 0 hingga 1.
 */
function setRPM(rpm_01) {
    const maxDots = 8;
    // Nilai RPM dari 0.0 sampai 1.0
    const rpmLevel = Math.max(0, Math.min(maxDots, Math.ceil(rpm_01 * maxDots))); 
    const rpmDots = document.querySelectorAll('#rpm-display .dot');
    
    rpmDots.forEach((dot, index) => {
        dot.classList.toggle('active', index < rpmLevel);
    });
}

/**
 * Memperbarui bilah dan persentase bahan bakar.
 * @param {number} fuel_01 Nilai bahan bakar (0 hingga 1).
 */
function setFuel(fuel_01) {
    const fuel_100 = Math.max(0, Math.min(100, fuel_01 * 100));
    const fuelPercentElement = document.getElementById('fuel-percent');
    const fuelFill = document.getElementById('fuel-fill');

    if (fuelFill) fuelFill.style.height = `${Math.round(fuel_100)}%`;
    if (fuelPercentElement) fuelPercentElement.textContent = `${Math.round(fuel_100)}%`; 
}

/**
 * Memperbarui bilah dan persentase kesehatan/kerusakan.
 * @param {number} health_01 Nilai kesehatan/kerusakan (0 hingga 1).
 */
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

/**
 * Memperbarui tampilan gigi (Gear).
 * @param {number} gear Nilai gigi.
 */
function setGear(gear) {
    const gearElement = document.getElementById('gear-display');
    if (!gearElement) return;

    let displayGear = String(gear).toUpperCase();
    if (displayGear === '0') displayGear = 'N'; 
    if (displayGear.length > 1 && displayGear.match(/[A-Z]/i)) { 
        displayGear = displayGear[0];
    }
    gearElement.innerText = displayGear;
    gearElement.style.color = (displayGear === 'R' || displayGear === 'N' || displayGear === 'P') ? '#ff0000' : '#fff'; 
}

/**
 * Memperbarui status ikon lampu depan.
 * @param {number} state Status lampu depan (0: Off, 1: On, 2: High Beam).
 */
function setHeadlights(state) {
    const headlightsIcon = document.getElementById('headlights-icon');
    let displayOn = state === 1 || state === 2; 
    if (headlightsIcon) headlightsIcon.classList.toggle('active', displayOn);
}

/**
 * Mengontrol logika berkelip untuk indikator.
 * @param {number} state Nilai biner indikator (0: Off, 1: Kiri, 2: Kanan, 3: Hazard).
 */
function controlIndicators(state) {
    const turnLeft = document.getElementById('turn-left-icon'); 
    const turnRight = document.getElementById('turn-right-icon'); 
    
    if (state !== lastIndicatorState) {
        clearInterval(blinkInterval);
        
        // Nonaktifkan semua sebelum memulai interval baru
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

/**
 * Memperbarui status ikon sabuk pengaman.
 * @param {boolean} state Jika true, sabuk terpasang.
 */
function setSeatbelts(state) {
    const seatbeltIcon = document.getElementById('seatbelts-icon');
    if (seatbeltIcon) {
        seatbeltIcon.innerText = state ? 'link' : 'link_off'; // Gunakan ikon Material
        seatbeltIcon.classList.toggle('active', state); 
    }
}

/**
 * Mengatur mode kecepatan dan memperbarui unit.
 * @param {number} mode Mode kecepatan (0: KMH, 1: MPH, 2: Knots).
 */
function setSpeedMode(mode) {
    speedMode = mode;
    const speedModeElement = document.getElementById('speed-mode-unit');
    if (!speedModeElement) return;
    speedModeElement.innerText = (mode === 1) ? 'MPH' : ((mode === 2) ? 'Knots' : 'KMH');
}


// =======================================================
// SIMULASI DATA (Untuk Demo Web Murni)
// =======================================================

function startSimulation() {
    if (isSimulationRunning) return;
    isSimulationRunning = true;
    let currentSpeed = 0; // m/s
    let currentFuel = 1.0; 
    let currentHealth = 1.0; 
    
    const maxSpeed = 35; 
    const maxRPM = 1.0; 
    
    const headUnitContainer = document.getElementById('custom-headunit-container');
    if (headUnitContainer) headUnitContainer.style.display = 'flex'; // Tampilkan HUD

    setInterval(() => {
        // SIMULASI KECEPATAN (Akselerasi/Deselerasi)
        const speedChange = (Math.random() - 0.5) * 5; 
        currentSpeed = Math.max(0, Math.min(maxSpeed, currentSpeed + speedChange));
        setSpeed(currentSpeed);

        // SIMULASI RPM (Lebih tinggi saat kecepatan tinggi)
        let simulatedRPM = Math.min(maxRPM, currentSpeed / (maxSpeed * 0.8));
        setRPM(simulatedRPM);
        
        // SIMULASI GEAR
        let currentGear = 'N';
        if (currentSpeed > 30) currentGear = '5';
        else if (currentSpeed > 25) currentGear = '4';
        else if (currentSpeed > 18) currentGear = '3';
        else if (currentSpeed > 10) currentGear = '2';
        else if (currentSpeed > 0.5) currentGear = '1';
        else currentGear = 'P'; // Park/Neutral saat diam
        setGear(currentGear);

        // SIMULASI BAHAN BAKAR (Menurun perlahan)
        currentFuel = Math.max(0, currentFuel - 0.0005); 
        setFuel(currentFuel);
        setEngine(currentFuel > 0.02); 

        // SIMULASI KESEHATAN (Kadang-kadang turun)
        if (Math.random() < 0.01) { 
             currentHealth = Math.max(0.1, currentHealth - 0.03);
        }
        setHealth(currentHealth);
        
        // SIMULASI INDIKATOR (Berubah acak)
        const indicatorRoll = Math.random();
        if (indicatorRoll < 0.015) { setLeftIndicator(true); setRightIndicator(false); }
        else if (indicatorRoll < 0.03) { setRightIndicator(true); setLeftIndicator(false); }
        else if (indicatorRoll < 0.04) { setLeftIndicator(true); setRightIndicator(true); } // Hazard
        else { setLeftIndicator(false); setRightIndicator(false); }

        // SIMULASI LAMPU
        setHeadlights(Math.random() < 0.7 ? 1 : 0);

        // SIMULASI SABUK PENGAMAN (Aktif jika kecepatan > 0)
        setSeatbelts(currentSpeed > 1.0);

    }, 200); 
}


// =======================================================
// INITIALIZATION
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // PETAKAN ELEMENTS KE ID BARU
    elements.engine = document.getElementById('engine-icon'); // ID baru
    elements.speed = document.getElementById('speed-display'); // ID baru
    elements.rpm = document.getElementById('rpm-display'); // ID baru (sekarang div)
    elements.fuel = document.getElementById('fuel-fill'); // ID baru (sekarang fill bar)
    elements.health = document.getElementById('health-fill'); // ID baru (sekarang fill bar)
    elements.gear = document.getElementById('gear-display'); // ID baru
    elements.headlights = document.getElementById('headlights-icon'); // ID baru
    elements.seatbelts = document.getElementById('seatbelts-icon'); // ID baru

    // Set nilai awal dan mode
    setSpeedMode(1); // Default MPH

    // Mulai simulasi data agar HUD bergerak di browser
    startSimulation(); 
});
