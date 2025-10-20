document.addEventListener('DOMContentLoaded', () => {
    // Elemen Kecepatan & Gear
    const currentSpeedElement = document.getElementById('current-speed');
    const gearElement = document.getElementById('gear');
    
    // Elemen Bar & Persentase
    const healthFill = document.getElementById('health-fill');
    const fuelFill = document.getElementById('fuel-fill');
    const healthPercent = document.getElementById('health-percent');
    const fuelPercent = document.getElementById('fuel-percent');
    
    // Elemen Power Dots
    const powerDots = document.querySelectorAll('.power-bar-dots .dot');
    
    // Elemen Indikator Sein
    const turnLeft = document.querySelector('.turn-left');
    const turnRight = document.querySelector('.turn-right');

    let speed = 0;
    let health = 100;
    let fuel = 87;
    let turnSignalState = 0; // 0=off, 1=left, 2=right
    let targetSpeed = 0;
    
    function updateDashboard() {
        // --- 1. Simulasi Kecepatan & Gear ---
        // Ganti target speed setiap 2 detik untuk variasi
        if (Math.random() < 0.05) {
            targetSpeed = Math.floor(Math.random() * 160);
        }
        
        // Akselerasi/Deselerasi
        if (speed < targetSpeed) {
            speed = Math.min(targetSpeed, speed + 1);
        } else if (speed > targetSpeed) {
            speed = Math.max(0, speed - 2);
        }

        currentSpeedElement.textContent = Math.round(speed);

        // Update Gear
        let gear;
        if (speed < 5) {
            gear = 'R'; 
        } else if (speed < 30) {
            gear = '1';
        } else if (speed < 60) {
            gear = '2';
        } else if (speed < 100) {
            gear = '3';
        } else {
            gear = 'D'; 
        }
        gearElement.textContent = gear;


        // --- 2. Simulasi Bar & Persentase (Health/Fuel) ---
        health = Math.max(0, Math.min(100, health + (Math.random() * 0.2 - 0.1))); // +/- 0.1
        fuel = Math.max(0, fuel - 0.05); // Turun 0.05% setiap 50ms

        // Update tampilan bar
        healthFill.style.height = `${health}%`;
        fuelFill.style.height = `${fuel}%`;
        
        healthPercent.textContent = `${Math.round(health)}%`;
        fuelPercent.textContent = `${Math.round(fuel)}%`;
        
        // Warna Health Bar
        if (health < 30) {
            healthFill.style.backgroundColor = '#ff0000'; 
        } else if (health < 60) {
            healthFill.style.backgroundColor = '#ffff00'; 
        } else {
            healthFill.style.backgroundColor = '#00ff00'; 
        }
        
        // --- 3. Simulasi Power Dots (RPM/Power) ---
        const maxDots = 4;
        let powerLevel = Math.min(maxDots, Math.ceil(speed / (150 / maxDots))); 
        
        powerDots.forEach((dot, index) => {
            dot.classList.toggle('active', index < powerLevel);
        });
        
        // --- 4. Simulasi Indikator Sein (Berkedip) ---
        // Ganti status sein sesekali (misalnya 1%)
        if (Math.random() < 0.01) {
            turnSignalState = Math.floor(Math.random() * 3); // 0, 1, atau 2
        }

        // Logika Berkedip
        const isBlinking = Math.floor(Date.now() / 250) % 2 === 0;

        turnLeft.classList.remove('active');
        turnRight.classList.remove('active');

        if (turnSignalState === 1 && isBlinking) {
            turnLeft.classList.add('active');
        } else if (turnSignalState === 2 && isBlinking) {
            turnRight.classList.add('active');
        }
    }

    // Perbarui dashboard setiap 50ms (20 FPS) untuk fungsionalitas realtime
    setInterval(updateDashboard, 50); 
    
    // Inisialisasi awal
    updateDashboard();
});
