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
    const powerDotsContainer = document.querySelector('.power-bar-dots');
    const powerDots = powerDotsContainer.querySelectorAll('.dot');
    
    // Elemen Indikator
    const turnLeft = document.querySelector('.turn-left');
    const turnRight = document.querySelector('.turn-right');

    let speed = 0;
    let health = 100;
    let fuel = 87;
    let powerLevel = 2; // 0-4

    function updateDashboard() {
        // --- 1. Simulasi Kecepatan & Gear ---
        let targetSpeed = Math.floor(Math.random() * 150);
        
        // Perlambatan/akselerasi halus
        if (speed < targetSpeed) {
            speed = Math.min(targetSpeed, speed + 1);
        } else if (speed > targetSpeed) {
            speed = Math.max(0, speed - 2);
        }

        // Update Kecepatan (MPH)
        currentSpeedElement.textContent = Math.round(speed);

        // Update Gear
        let gear;
        if (speed < 5) {
            gear = 'R'; // Asumsi R untuk speed rendah
        } else if (speed < 30) {
            gear = '1';
        } else if (speed < 60) {
            gear = '2';
        } else if (speed < 100) {
            gear = '3';
        } else {
            gear = 'D'; // Drive
        }
        gearElement.textContent = gear;


        // --- 2. Simulasi Bar & Persentase (Health/Fuel) ---
        // Health: Turun perlahan & acak
        health = Math.max(0, health + (Math.random() > 0.95 ? -1 : 0)); 
        // Fuel: Turun sangat perlahan
        fuel = Math.max(0, fuel - 0.05);

        // Update tampilan
        healthFill.style.height = `${health}%`;
        fuelFill.style.height = `${fuel}%`;
        
        healthPercent.textContent = `${Math.round(health)}%`;
        fuelPercent.textContent = `${Math.round(fuel)}%`;
        
        // --- 3. Simulasi Power Dots (RPM) ---
        // Power Level berdasarkan speed (0-4 dots)
        powerLevel = Math.min(4, Math.ceil(speed / 40)); 
        
        powerDots.forEach((dot, index) => {
            dot.classList.toggle('active', index < powerLevel);
        });
        
        // --- 4. Simulasi Indikator Sein (Berkedip) ---
        if (Math.random() > 0.9) {
            turnLeft.classList.toggle('active');
        } else if (Math.random() < 0.1) {
            turnRight.classList.toggle('active');
        }
    }

    // Perbarui dashboard setiap 100ms untuk fungsionalitas realtime
    setInterval(updateDashboard, 100); 
    
    // Inisialisasi awal
    updateDashboard();
});
