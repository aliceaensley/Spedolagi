document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen Dashboard yang Kita Gunakan ---
    const currentSpeedElement = document.getElementById('current-speed');
    const gearElement = document.getElementById('gear');
    const healthFill = document.getElementById('health-fill');
    const fuelFill = document.getElementById('fuel-fill');
    const healthPercent = document.getElementById('health-percent');
    const fuelPercent = document.getElementById('fuel-percent');
    const powerDots = document.querySelectorAll('.power-bar-dots .dot');
    const turnLeft = document.querySelector('.turn-left');
    const turnRight = document.querySelector('.turn-right');
    const dashboardBox = document.querySelector('.dashboard-box');
    const unitTextElement = document.querySelector('.unit-text'); // Elemen untuk unit MPH/KMH

    // --- State Internal Berdasarkan Kode Referensi ---
    let blinkInterval;
    let speedMode = 1; // Default ke MPH (sesuai kode referensi)
    let isVisible = false;

    // Atur visibilitas awal ke Sembunyi
    dashboardBox.style.opacity = '0'; 
    dashboardBox.style.visibility = 'hidden'; 
    

    // =======================================================
    // LOGIKA FUNGSIONALITAS BERDASARKAN KODE REFERENSI
    // =======================================================

    /** Mengupdate Unit Kecepatan (MPH, KMH, Knots) */
    function setSpeedUnit(mode) {
        speedMode = mode;
        switch(mode) {
            case 1: unitTextElement.innerText = 'MPH'; break;
            case 2: unitTextElement.innerText = 'Knots'; break;
            default: unitTextElement.innerText = 'KMH';
        }
    }

    /** Mengupdate Angka Kecepatan (Melakukan Konversi m/s ke unit yang benar) */
    function setSpeed(speed_ms) {
        let speedDisplay;
        switch(speedMode) {
            case 1: speedDisplay = Math.round(speed_ms * 2.236936); break; // MPH
            case 2: speedDisplay = Math.round(speed_ms * 1.943844); break; // Knots
            default: speedDisplay = Math.round(speed_ms * 3.6); // KMH
        }
        currentSpeedElement.textContent = speedDisplay;
        
        // Update Power Dots (RPM/Power Level) berdasarkan kecepatan yang sudah dikonversi (misalnya, MPH)
        const maxDots = 4;
        let scaleMax = speedMode === 1 ? 120 : 180; // Asumsi max 120 MPH atau 180 KMH
        let powerLevel = Math.min(maxDots, Math.ceil(speedDisplay / (scaleMax / maxDots))); 
        
        powerDots.forEach((dot, index) => {
            dot.classList.toggle('active', index < powerLevel);
        });
    }

    /** Mengupdate Bar Kesehatan (0-1) */
    function setHealth(health_01) {
        const health_100 = Math.max(0, Math.min(100, health_01 * 100));

        healthFill.style.height = `${Math.round(health_100)}%`;
        healthPercent.textContent = `${Math.round(health_100)}%`;
        
        if (health_100 < 30) {
            healthFill.style.backgroundColor = '#ff0000'; 
        } else if (health_100 < 60) {
            healthFill.style.backgroundColor = '#ffff00'; 
        } else {
            healthFill.style.backgroundColor = '#00ff00'; 
        }
    }

    /** Mengupdate Bar Bahan Bakar (0-1) */
    function setFuel(fuel_01) {
        const fuel_100 = Math.max(0, Math.min(100, fuel_01 * 100));

        fuelFill.style.height = `${Math.round(fuel_100)}%`;
        fuelPercent.textContent = `${Math.round(fuel_100)}%`;
    }

    /** Mengupdate Gear */
    function setGear(gear) {
        let displayGear = String(gear || 'R').toUpperCase();
        
        // Jika gear 0, biasanya Netral (N) atau Mundur (R) jika kendaraan tidak bergerak. Kita set 'R' default.
        if (displayGear === '0') displayGear = 'R'; 
        
        gearElement.textContent = displayGear;
        gearElement.style.color = (displayGear === 'R' || displayGear === 'N') ? '#ff0000' : '#fff'; 
    }

    /** Mengupdate Sein (indicators adalah bitwise, tapi kita hanya butuh 1, 2, atau 0) */
    function setIndicators(leftState, rightState) {
        let state = 0;
        if (leftState) state = 1;
        if (rightState) state = 2;
        if (leftState && rightState) state = 3; // Hazard

        // Hentikan interval lama jika status berubah
        if (state !== setIndicators.lastState) {
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
        setIndicators.lastState = state;
    }
    setIndicators.lastState = 0; // State awal

    // =======================================================
    // FUNGSI UTAMA PENGHUBUNG (NUI LISTENER)
    // =======================================================
    
    // Inisialisasi unit kecepatan agar terlihat
    setSpeedUnit(speedMode); 
    
    // Menerima pesan dari game client
    window.addEventListener('message', (event) => {
        const data = event.data;
        
        // Gunakan 'speedoUpdate' atau 'UPDATE_HUD_DATA' sebagai tipe pesan
        if (data.type === 'speedoUpdate' || data.type === 'UPDATE_HUD_DATA') {
            
            // 1. KONTROL VISIBILITAS
            if (data.show !== undefined) {
                dashboardBox.style.opacity = data.show ? '1' : '0';
                dashboardBox.style.visibility = data.show ? 'visible' : 'hidden';
                isVisible = data.show;
                if (!isVisible) return; 
            }
            if (!isVisible) return; 

            // 2. DATA UTAMA (Menggunakan data yang dikirim oleh skrip Anda)
            if (data.speed !== undefined) setSpeed(data.speed);
            if (data.gear !== undefined) setGear(data.gear);
            if (data.health !== undefined) setHealth(data.health);
            if (data.fuel !== undefined) setFuel(data.fuel);
            
            // 3. INDICATORS
            // Kode referensi Anda menggunakan dua setter terpisah, jadi kita harus menebak state gabungan
            if (data.indicators !== undefined) {
                // Asumsi data.indicators adalah objek {left: boolean, right: boolean}
                setIndicators(data.indicators.left, data.indicators.right);
            } else if (data.leftIndicator !== undefined || data.rightIndicator !== undefined) {
                setIndicators(data.leftIndicator || false, data.rightIndicator || false);
            }

            // 4. SPEED MODE
            if (data.speedMode !== undefined) setSpeedUnit(data.speedMode);

            // 5. IKON STATUS LAINNYA (Anda dapat menambahkan fungsi setHeadlights, setEngine, dll. jika diperlukan)
            // Contoh untuk Headlights:
            // const lightsIcon = document.querySelector('.lights-icon');
            // lightsIcon.classList.toggle('active', data.headlights > 0);
        }
    });

    // --- Demo untuk Testing Browser ---
    /* Hapus bagian ini saat di lingkungan game */
    let demoSpeed = 0; let targetSpeed = 0; let demoTurnSignal = 0; let demoHealth = 1; let demoFuel = 0.87;
    
    setTimeout(() => {
        setSpeedUnit(1); // Set ke MPH
        updateUI({ speed: 0, health: 1, fuel: 0.87, gear: 'R', leftIndicator: false, rightIndicator: false, show: true });
    }, 500);

    setInterval(() => {
        if (dashboardBox.style.opacity === '0') return;

        if (Math.random() < 0.05) {
            targetSpeed = Math.floor(Math.random() * 45); // Target m/s
            demoTurnSignal = Math.floor(Math.random() * 3);
        }
        if (demoSpeed < targetSpeed) { demoSpeed = Math.min(targetSpeed, demoSpeed + 0.5); } 
        else if (demoSpeed > targetSpeed) { demoSpeed = Math.max(0, demoSpeed - 1); }

        demoHealth = Math.max(0, Math.min(1, demoHealth + (Math.random() * 0.002 - 0.001)));
        demoFuel = Math.max(0, demoFuel - 0.0005);

        // Simulasi pengiriman data
        updateUI({
            speed: demoSpeed,
            health: demoHealth,
            fuel: demoFuel,
            gear: demoSpeed > 27 ? 'D' : (demoSpeed > 17 ? '2' : (demoSpeed > 2 ? '1' : 'R')),
            leftIndicator: demoTurnSignal === 1,
            rightIndicator: demoTurnSignal === 2,
            show: true
        });
    }, 50); 
    /* Hapus bagian DEMO sampai sini */
});
