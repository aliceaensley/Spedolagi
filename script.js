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

    // --- State Global ---
    let blinkInterval;
    let isVisible = true; // Di set true karena CSS diubah untuk terlihat (mode debugging)

    // Fungsi Utama untuk Menerima dan Memperbarui Data (Dipanggil dari Game/Server)
    /**
     * @param {object} data - Objek data dari game/server
     * @param {number} data.speed - Kecepatan saat ini (misalnya 0-200)
     * @param {number} data.health - Persentase Kesehatan (0-100)
     * @param {number} data.fuel - Persentase Bahan Bakar (0-100)
     * @param {string} data.gear - Gear saat ini (N, R, 1, 2, 3, D, dll.)
     * @param {number} data.turnSignal - Status sein (0=off, 1=left, 2=right)
     * @param {boolean} [data.show] - Visibilitas dashboard (true/false)
     */
    window.updateData = function(data) {
        
        // 1. Kontrol Visibilitas (Opsional, jika skrip game ingin menyembunyikan)
        if (data.show !== undefined) {
            dashboardBox.style.opacity = data.show ? '1' : '0';
            dashboardBox.style.visibility = data.show ? 'visible' : 'hidden';
            isVisible = data.show;
        }

        if (!isVisible) return; 

        // 2. Kecepatan & Gear
        currentSpeedElement.textContent = Math.round(data.speed);
        
        let displayGear = String(data.gear).toUpperCase();
        gearElement.textContent = displayGear;
        if (displayGear === 'R') {
             gearElement.style.color = '#ff0000'; 
        } else {
             gearElement.style.color = '#fff'; 
        }


        // 3. Bar Health
        healthFill.style.height = `${Math.round(data.health)}%`;
        healthPercent.textContent = `${Math.round(data.health)}%`;
        
        if (data.health < 30) {
            healthFill.style.backgroundColor = '#ff0000'; 
        } else if (data.health < 60) {
            healthFill.style.backgroundColor = '#ffff00'; 
        } else {
            healthFill.style.backgroundColor = '#00ff00'; 
        }
        
        // 4. Bar Fuel
        fuelFill.style.height = `${Math.round(data.fuel)}%`;
        fuelPercent.textContent = `${Math.round(data.fuel)}%`;
        
        // 5. Power Dots (RPM/Power Level)
        const maxDots = 4;
        let powerLevel = Math.min(maxDots, Math.ceil(data.speed / (160 / maxDots))); 
        
        powerDots.forEach((dot, index) => {
            dot.classList.toggle('active', index < powerLevel);
        });

        // 6. Kontrol Sein
        controlTurnSignal(data.turnSignal);
    };

    // Fungsi Kontrol Sein (Mengelola Interval Berkedip)
    function controlTurnSignal(state) {
        clearInterval(blinkInterval);
        turnLeft.classList.remove('active');
        turnRight.classList.remove('active');

        if (state === 1) { 
            blinkInterval = setInterval(() => {
                turnLeft.classList.toggle('active');
            }, 250);
        } else if (state === 2) { 
            blinkInterval = setInterval(() => {
                turnRight.classList.toggle('active');
            }, 250);
        } else {
            turnLeft.classList.remove('active');
            turnRight.classList.remove('active');
        }
    }

    // Inisialisasi awal UI
    // Kita panggil window.updateData sekali untuk memastikan semua elemen diatur ke nilai awal
    window.updateData({ speed: 0, health: 100, fuel: 87, gear: 'R', turnSignal: 0, show: isVisible });
});
