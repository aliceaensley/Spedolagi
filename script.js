// =======================================================
// VARIABEL GLOBAL & KONFIGURASI AUDIO
// =======================================================
let elements = {};
let speedMode = 1; 
let indicators = 0;

const onOrOff = state => state ? 'On' : 'Off';

// MENGGUNAKAN NAMA FILE LOKAL
const YAMETE_AUDIO_URL = 'yamete.mp3'; 
const BENSIN_AUDIO_URL = 'bensin.mp3'; 
const SEKARAT_AUDIO_URL = 'sekarat.mp3'; 

// Membuat objek Audio satu kali
const yameteAudio = new Audio(YAMETE_AUDIO_URL);
yameteAudio.volume = 0.5; 

const bensinAudio = new Audio(BENSIN_AUDIO_URL);
bensinAudio.volume = 0.6; 
const sekaratAudio = new Audio(SEKARAT_AUDIO_URL);
sekaratAudio.volume = 0.8; 

// Status untuk mengontrol pemutaran audio berulang dan bersyarat
let isBensinAlertActive = false;
let isSekaratAlertActive = false; 
let bensinAlertTimer; // Timer untuk mengontrol perulangan bensin.mp3

// =======================================================
// FUNGSI SETTER
// =======================================================

function setEngine(state) {
    document.getElementById('engine-icon').classList.toggle('active', state);
    elements.engine.innerText = onOrOff(state); 
}

function setSpeed(speed_ms) {
    let speedDisplay;
    switch(speedMode) {
        case 1: speedDisplay = Math.round(speed_ms * 2.236936); break; // MPH
        case 2: speedDisplay = Math.round(speed_ms * 1.943844); break; // Knots
        default: speedDisplay = Math.round(speed_ms * 3.6); // KMH
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
    const fuelFill = document.getElementById('fuel-fill');

    if (fuelFill) {
        fuelFill.style.height = `${Math.round(fuel_100)}%`;
        
        // Logika Visual Bensin (Merah di bawah 20%)
        if (fuel_100 <= 20) {
             fuelFill.style.backgroundColor = '#ff0000';
             fuelPercentElement.style.color = '#ff0000';
        } else {
             fuelFill.style.backgroundColor = '#ffaa00';
             fuelPercentElement.style.color = '#ffaa00';
        }
    }
    
    if (fuelPercentElement) {
        fuelPercentElement.textContent = `${Math.round(fuel_100)}%`; 
    }

    elements.fuel.innerText = `${fuel_100.toFixed(1)}%`;


    // =======================================================
    // LOGIKA AUDIO BENSIN BERDASARKAN AMBANG BATAS
    // =======================================================

    // FUNGSI UTILITY UNTUK MENGHENTIKAN SEMUA BENSIN ALERT
    const stopAllFuelAlerts = () => {
        // Hentikan timer bensin.mp3
        if (bensinAlertTimer) {
            clearTimeout(bensinAlertTimer);
            bensinAlertTimer = null;
        }
        isBensinAlertActive = false;
        
        // Hentikan sekarat.mp3
        if (isSekaratAlertActive) {
            sekaratAudio.pause();
            sekaratAudio.loop = false;
            isSekaratAlertActive = false;
        }
    };

    // A. LOGIKA 20% sampai >10% (TING TING dengan delay 10 detik)
    if (fuel_100 > 10 && fuel_100 <= 20) {
        // Hentikan sekarat.mp3 jika sedang aktif dan masuk ke mode bensin
        if (isSekaratAlertActive) {
             sekaratAudio.pause();
             isSekaratAlertActive = false;
        }

        if (!isBensinAlertActive) {
            isBensinAlertActive = true;
            
            const playBensinAlert = () => {
                // KONDISI PENGHENTIAN: Hentikan perulangan jika sudah di bawah atau sama dengan 10%
                if (fuel_01 * 100 <= 10) { 
                    isBensinAlertActive = false;
                    bensinAlertTimer = null; 
                    return; 
                }
                
                // Putar audio ganda (ting ting)
                bensinAudio.currentTime = 0;
                bensinAudio.play().then(() => {
                    // Putar audio kedua setelah jeda singkat (efek dobel)
                    setTimeout(() => {
                        bensinAudio.currentTime = 0;
                        bensinAudio.play();
                    }, 200); 
                }).catch(e => console.error("Error playing bensin audio:", e));
                
                // Jadwalkan pemutaran berikutnya setelah 10 detik
                bensinAlertTimer = setTimeout(playBensinAlert, 10000); 
            };
            
            // Mulai pemutaran pertama
            playBensinAlert();
        }
        
    // B. LOGIKA 10% sampai >0% (SEKARAT.mp3 tanpa delay, non-stop)
    } else if (fuel_100 > 0 && fuel_100 <= 10) {
        // Pastikan timer bensin dihentikan saat memasuki zona sekarat (<=10%)
        if (bensinAlertTimer) {
            clearTimeout(bensinAlertTimer);
            bensinAlertTimer = null;
        }
        isBensinAlertActive = false; 

        if (!isSekaratAlertActive) {
            isSekaratAlertActive = true;
            
            sekaratAudio.loop = true; // Set loop untuk non-stop
            sekaratAudio.currentTime = 0;
            sekaratAudio.play().catch(e => console.error("Error playing sekarat audio:", e));
        }

    // C. LOGIKA >20% atau 0% (Hentikan semua audio)
    } else {
        // Hentikan semua audio jika bensin sudah aman (>20%) atau habis total (0%)
        stopAllFuelAlerts();
    }
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
    
    // Warna Merah untuk R/N, Putih untuk angka
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

    // Hindari mengganggu interval jika state tidak berubah
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

function setLeftIndicator(state) {
    // 0b01 = Kiri, 0b10 = Kanan
    indicators = (indicators & 0b10) | (state ? 0b01 : 0b00);
    controlIndicators(indicators);
    elements.indicators.innerText = `${indicators & 0b01 ? 'On' : 'Off'} / ${indicators & 0b10 ? 'On' : 'Off'}`;
}

function setRightIndicator(state) {
    indicators = (indicators & 0b01) | (state ? 0b10 : 0b00);
    controlIndicators(indicators);
    elements.indicators.innerText = `${indicators & 0b01 ? 'On' : 'Off'} / ${indicators & 0b10 ? 'On' : 'Off'}`;
}

/** * Fungsi Seatbelts.
 * Memutar yamete.mp3 ketika state = true (sabuk terpasang).
 */
function setSeatbelts(state) {
    const seatbeltIcon = document.getElementById('abs-icon');
    
    // LOGIKA AUDIO
    if (state === true) {
        // Putar audio dari awal
        yameteAudio.pause();
        yameteAudio.currentTime = 0; 
        yameteAudio.play().catch(e => console.error("Error playing audio:", e));
    } 

    // LOGIKA VISUAL
    if (seatbeltIcon) {
        seatbeltIcon.classList.toggle('active', state); 
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
// FUNGSI UTAMA PENGHUBUNG (NUI LISTENER)
// =======================================================

const updateUI = (data) => {
    const dashboardBox = document.getElementById('dashboard-box');
    let isVisible = dashboardBox.style.opacity === '1';

    // KONTROL VISIBILITAS TOTAL
    if (data.show !== undefined) {
        dashboardBox.style.opacity = data.show ? '1' : '0';
        dashboardBox.style.visibility = data.show ? 'visible' : 'hidden';
        isVisible = data.show;
        if (!isVisible) {
            clearInterval(blinkInterval);
            lastIndicatorState = 0;
            // Hentikan semua audio jika HUD disembunyikan
            if (isSekaratAlertActive) sekaratAudio.pause();
            isBensinAlertActive = false;
            isSekaratAlertActive = false;
            return;
        }
    }
    if (!isVisible) return; 
    
    // DATA UTAMA
    if (data.engine !== undefined) setEngine(data.engine);
    if (data.speed !== undefined) setSpeed(data.speed);
    if (data.rpm !== undefined) setRPM(data.rpm);
    if (data.health !== undefined) setHealth(data.health); 
    if (data.gear !== undefined) setGear(data.gear);
    if (data.headlights !== undefined) setHeadlights(data.headlights);
    if (data.seatbelts !== undefined) setSeatbelts(data.seatbelts); 
    if (data.speedMode !== undefined) setSpeedMode(data.speedMode);

    // INDICATORS
    if (data.leftIndicator !== undefined) setLeftIndicator(data.leftIndicator);
    if (data.rightIndicator !== undefined) setRightIndicator(data.rightIndicator);

    // Panggil setFuel setelah semua data terkait lainnya diperbarui
    if (data.fuel !== undefined) setFuel(data.fuel); 
};


// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // INISIALISASI ELEMENTS
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
        
        // ID VISUAL
        'dashboard-box': document.getElementById('dashboard-box'),
        'health-fill': document.getElementById('health-fill'),
        'fuel-fill': document.getElementById('fuel-fill'),
        'health-percent': document.getElementById('health-percent'),
        'fuel-percent': document.getElementById('fuel-percent'),
        'turn-left-icon': document.getElementById('turn-left-icon'),
        'turn-right-icon': document.getElementById('turn-right-icon'),

        // WELCOME OVERLAY
        'welcome-overlay': document.getElementById('welcome-overlay'), 
    };
    
    // LOGIKA WELCOME OVERLAY (Hanya tampil 2 detik)
    if (elements['welcome-overlay']) {
        setTimeout(() => {
            elements['welcome-overlay'].classList.add('hidden');
        }, 2000); // 2000 milidetik = 2 detik
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
        speed: 0, 
        health: 1, 
        fuel: 0.87, // Nilai awal 87%
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
