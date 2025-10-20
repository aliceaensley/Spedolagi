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

    // --- State Global untuk Indikator Sein ---
    let blinkInterval;
    let isVisible = false; // State untuk mengontrol visibilitas total

    // Atur visibilitas awal (tersembunyi) di CSS. 
    // Di sini kita pastikan mulai dengan angka 0 dan Gear 'R' (default)
    
    // Inisialisasi awal UI saat DOM dimuat
    currentSpeedElement.textContent = '0';
    gearElement.textContent = 'R';
    healthFill.style.height = '100%';
    fuelFill.style.height = '100%';
    healthPercent.textContent = '100%';
    fuelPercent.textContent = '100%';
    powerDots.forEach(dot => dot.classList.remove('active'));
    dashboardBox.style.opacity = '0'; // Sembunyikan dashboard secara default

    
    // Fungsi Utama untuk Menerima dan Memperbarui Data (dipanggil dari Game/Server)
    /**
     * @param {object} data - Objek data dari game/server
     * @param {number} data.speed - Kecepatan saat ini (misalnya 0-200)
     * @param {number} data.health - Persentase Kesehatan (0-100)
     * @param {number} data.fuel - Persentase Bahan Bakar (0-100)
     * @param {string} data.gear - Gear saat ini (N, R, 1, 2, 3, D, dll.)
     * @param {number} data.turnSignal - Status sein (0=off, 1=left, 2=right)
     * @param {boolean} data.show - Visibilitas dashboard (true/false)
     */
    window.updateData = function(data) {
        
        // 1. Kontrol Visibilitas Total (Sesuai dengan logika jgvrp-speedometer)
        if (data.show !== undefined) {
            dashboardBox.style.opacity = data.show ? '1' : '0';
            dashboardBox.style.visibility = data.show ? 'visible' : 'hidden';
            isVisible = data.show;
        }

        // Jika tidak terlihat, hentikan pembaruan visual lainnya
        if (!isVisible) return; 


        // 2. Kecepatan & Gear
        currentSpeedElement.textContent = Math.round(data.speed);
        
        let displayGear = String(data.gear).toUpperCase();
        gearElement.textContent = displayGear;
        // Penyesuaian warna gear untuk R (Mundur)
        if (displayGear === 'R') {
             gearElement.style.color = '#ff0000'; 
        } else {
             gearElement.style.color = '#fff'; // Default
        }


        // 3. Bar Health
        healthFill.style.height = `${Math.round(data.health)}%`;
        healthPercent.textContent = `${Math.round(data.health)}%`;
        
        if (data.health < 30) {
            healthFill.style.backgroundColor = '#ff0000'; // Merah
        } else if (data.health < 60) {
            healthFill.style.backgroundColor = '#ffff00'; // Kuning
        } else {
            healthFill.style.backgroundColor = '#00ff00'; // Hijau
        }
        
        // 4. Bar Fuel
        fuelFill.style.height = `${Math.round(data.fuel)}%`;
        fuelPercent.textContent = `${Math.round(data.fuel)}%`;
        
        // 5. Power Dots (RPM/Power Level)
        const maxDots = 4;
        // Asumsi power level adalah persentase kecepatan dari maks (misalnya 160)
        let powerLevel = Math.min(maxDots, Math.ceil(data.speed / (160 / maxDots))); 
        
        powerDots.forEach((dot, index) => {
            dot.classList.toggle('active', index < powerLevel);
        });

        // 6. Kontrol Sein
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

    // --- PENTING: Struktur untuk Menerima Data dari Game/Server ---
    // Jika Anda menggunakan FiveM/RageMP NUI, Anda akan menggunakan event listener seperti ini:
    /*
    window.addEventListener('message', function(event) {
        if (event.data.type === "UPDATE_HUD_DATA") {
            window.updateData(event.data.payload);
        }
    });
    */
});
