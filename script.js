document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen Dashboard ---
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
    const unitTextElement = document.querySelector('.unit-text');

    // --- State Internal ---
    let blinkInterval;
    let speedMode = 1; // Default ke MPH
    let isVisible = true; 

    // Inisialisasi: Atur tampilan awal
    currentSpeedElement.textContent = '0';
    gearElement.textContent = 'R';
    gearElement.style.color = '#ff0000'; 
    setSpeedUnit(speedMode); 
    
    // =======================================================
    // LOGIKA FUNGSIONALITAS
    // =======================================================

    function setSpeedUnit(mode) {
        speedMode = mode;
        switch(mode) {
            case 1: unitTextElement.innerText = 'MPH'; break;
            case 2: unitTextElement.innerText = 'Knots'; break;
            default: unitTextElement.innerText = 'KMH';
        }
    }

    function setSpeed(speed_ms) {
        let speedDisplay;
        switch(speedMode) {
            case 1: speedDisplay = Math.round(speed_ms * 2.236936); break; 
            case 2: speedDisplay = Math.round(speed_ms * 1.943844); break; 
            default: speedDisplay = Math.round(speed_ms * 3.6); 
        }
        currentSpeedElement.textContent = speedDisplay;
        
        const maxDots = 4;
        let scaleMax = speedMode === 1 ? 120 : 180; 
        let powerLevel = Math.min(maxDots, Math.ceil(speedDisplay / (scaleMax / maxDots))); 
        
        powerDots.forEach((dot, index) => {
            dot.classList.toggle('active', index < powerLevel);
        });
    }

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

    function setFuel(fuel_01) {
        const fuel_100 = Math.max(0, Math.min(100, fuel_01 * 100));

        fuelFill.style.height = `${Math.round(fuel_100)}%`;
        fuelPercent.textContent = `${Math.round(fuel_100)}%`;
    }

    function setGear(gear) {
        let displayGear = String(gear || 'R').toUpperCase();
        if (displayGear === '0') displayGear = 'R'; 
        
        gearElement.textContent = displayGear;
        gearElement.style.color = (displayGear === 'R' || displayGear === 'N') ? '#ff0000' : '#fff'; 
    }

    function setIndicators(leftState, rightState) {
        let state = 0;
        if (leftState) state = 1;
        if (rightState) state = 2;
        if (leftState && rightState) state = 3; 

        if (state !== setIndicators.lastState) {
            clearInterval(blinkInterval);
            turnLeft.classList.remove('active');
            turnRight.classList.remove('active');

            if (state === 1) { blinkInterval = setInterval(() => { turnLeft.classList.toggle('active'); }, 250); } 
            else if (state === 2) { blinkInterval = setInterval(() => { turnRight.classList.toggle('active'); }, 250); } 
            else if (state === 3) { blinkInterval = setInterval(() => { turnLeft.classList.toggle('active'); turnRight.classList.toggle('active'); }, 250); }
        }
        setIndicators.lastState = state;
    }
    setIndicators.lastState = 0; 

    // =======================================================
    // FUNGSI UTAMA PENGHUBUNG (NUI LISTENER)
    // =======================================================
    
    const updateUI = (data) => {
        // 1. KONTROL VISIBILITAS TOTAL
        if (data.show !== undefined) {
            dashboardBox.style.opacity = data.show ? '1' : '0';
            dashboardBox.style.visibility = data.show ? 'visible' : 'hidden';
            isVisible = data.show;
            if (!isVisible) {
                clearInterval(blinkInterval);
                turnLeft.classList.remove('active');
                turnRight.classList.remove('active');
                return;
            }
        }
        if (!isVisible) return; 
        
        // 2. DATA UTAMA
        if (data.speed !== undefined) setSpeed(data.speed);
        if (data.gear !== undefined) setGear(data.gear);
        if (data.health !== undefined) setHealth(data.health);
        if (data.fuel !== undefined) setFuel(data.fuel);
        
        // 3. INDICATORS
        if (data.leftIndicator !== undefined || data.rightIndicator !== undefined) {
            setIndicators(data.leftIndicator || false, data.rightIndicator || false);
        }

        // 4. SPEED MODE
        if (data.speedMode !== undefined) setSpeedUnit(data.speedMode);

        // 5. ICON LAINNYA (Misalnya Engine State, Headlights, dll.)
        const engineIcon = document.getElementById('engine-icon');
        if (data.engineActive !== undefined) {
             engineIcon.classList.toggle('active', data.engineActive);
        }
        // ... Tambahkan logika untuk ikon lain di sini (headlights, abs, dll.)
    };

    // Menerima pesan dari game client
    window.addEventListener('message', (event) => {
        const data = event.data;
        if (data.type === 'speedoUpdate' || data.type === 'UPDATE_HUD_DATA') {
            updateUI(data.payload || data); 
        }
    });

    // Panggil updateUI sekali untuk memastikan nilai awal diatur.
    updateUI({ 
        speed: 0, 
        health: 1, 
        fuel: 0.87, 
        gear: 'R', 
        leftIndicator: false, 
        rightIndicator: false,
        engineActive: false,
        show: true
    });
});
