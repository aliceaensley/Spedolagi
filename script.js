document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen Dashboard (SAMA SEPERTI SEBELUMNYA) ---
    const currentSpeedElement = document.getElementById('current-speed');
    const gearElement = document.getElementById('gear');
    const healthFill = document.getElementById('health-fill');
    const fuelFill = document.getElementById('fuel-fill');
    const healthPercent = document.getElementById('health-percent');
    const fuelPercent = document.getElementById('fuel-percent');
    const powerDots = document.querySelectorAll('.power-bar-dots .dot');
    const turnLeft = document.querySelector('.turn-left');
    const turnRight = document.querySelector('.turn-right');

    // --- State Global untuk Indikator Sein ---
    let isBlinking = false;
    let blinkInterval;

    // Fungsi Utama untuk Menerima dan Memperbarui Data
    /**
     * @param {object} data - Objek data dari game/server
     * @param {number} data.speed - Kecepatan saat ini (misalnya 0-200)
     * @param {number} data.health - Persentase Kesehatan (0-100)
     * @param {number} data.fuel - Persentase Bahan Bakar (0-100)
     * @param {string} data.gear - Gear saat ini (N, R, 1, 2, 3, D, dll.)
     * @param {boolean} data.engineActive - Status mesin (true/false)
     * @param {number} data.turnSignal - Status sein (0=off, 1=left, 2=right)
     */
    window.updateData = function(data) {
        // Kecepatan
        currentSpeedElement.textContent = Math.round(data.speed);
        
        // Gear (Pastikan huruf besar untuk R, N, D)
        let displayGear = String(data.gear).toUpperCase();
        gearElement.textContent = displayGear;
        if (displayGear === 'R') {
             gearElement.style.color = '#ff0000'; // Merah untuk Mundur
        } else {
             gearElement.style.color = '#fff'; // Putih untuk lainnya (kecuali ada data custom)
        }

        // Bar Health
        healthFill.style.height = `${Math.round(data.health)}%`;
        healthPercent.textContent = `${Math.round(data.health)}%`;
        if (data.health < 30) {
            healthFill.style.backgroundColor = '#ff0000'; // Merah
        } else if (data.health < 60) {
            healthFill.style.backgroundColor = '#ffff00'; // Kuning
        } else {
            healthFill.style.backgroundColor = '#00ff00'; // Hijau
        }
        
        // Bar Fuel
        fuelFill.style.height = `${Math.round(data.fuel)}%`;
        fuelPercent.textContent = `${Math.round(data.fuel)}%`;
        
        // Power Dots (RPM/Power Level)
        const maxDots = 4;
        // Asumsi power level adalah persentase kecepatan dari maks (misalnya 160)
        let powerLevel = Math.min(maxDots, Math.ceil(data.speed / (160 / maxDots))); 
        
        powerDots.forEach((dot, index) => {
            dot.classList.toggle('active', index < powerLevel);
        });
        
        // Indikator Mesin (Akan diatur oleh CSS .active class jika ada)
        // const engineIcon = document.getElementById('engine-icon');
        // engineIcon.classList.toggle('active', data.engineActive);

        // Kontrol Sein
        controlTurnSignal(data.turnSignal);
    };

    // Fungsi Kontrol Sein (Mengelola Interval Berkedip)
    function controlTurnSignal(state) {
        // Hentikan interval lama jika ada
        clearInterval(blinkInterval);
        turnLeft.classList.remove('active');
        turnRight.classList.remove('active');

        if (state === 1) { // Kiri
            blinkInterval = setInterval(() => {
                turnLeft.classList.toggle('active');
            }, 250);
        } else if (state === 2) { // Kanan
            blinkInterval = setInterval(() => {
                turnRight.classList.toggle('active');
            }, 250);
        } else {
            // State 0 (Off) - Pastikan mati
            turnLeft.classList.remove('active');
            turnRight.classList.remove('active');
        }
    }

    // --- DEMO Fungsionalitas (Hanya untuk Testing di Browser) ---
    // Simulasikan data yang masuk setiap 100ms
    let demoSpeed = 0;
    let demoHealth = 100;
    let demoFuel = 87;
    let demoTurnSignal = 0;
    
    // Ganti target speed dan sein sesekali
    let targetSpeed = 0;

    setInterval(() => {
        if (Math.random() < 0.05) {
            targetSpeed = Math.floor(Math.random() * 160);
            demoTurnSignal = Math.floor(Math.random() * 3);
        }

        // Perlambatan/akselerasi
        if (demoSpeed < targetSpeed) {
            demoSpeed = Math.min(targetSpeed, demoSpeed + 2);
        } else if (demoSpeed > targetSpeed) {
            demoSpeed = Math.max(0, demoSpeed - 3);
        }

        // Perubahan Health/Fuel
        demoHealth = Math.max(0, Math.min(100, demoHealth + (Math.random() * 0.2 - 0.1)));
        demoFuel = Math.max(0, demoFuel - 0.02);

        // Panggil fungsi utama dengan data simulasi (inilah yang akan Anda ganti dengan panggilan API game)
        window.updateData({
            speed: demoSpeed,
            health: demoHealth,
            fuel: demoFuel,
            gear: demoSpeed > 100 ? 'D' : (demoSpeed > 60 ? '3' : (demoSpeed > 30 ? '2' : (demoSpeed > 5 ? '1' : 'R'))),
            engineActive: true,
            turnSignal: demoTurnSignal
        });
    }, 50); // Update sangat cepat

    // Inisialisasi awal
    window.updateData({ speed: 0, health: 100, fuel: 87, gear: 'R', engineActive: true, turnSignal: 0 });
});
