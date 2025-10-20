document.addEventListener('DOMContentLoaded', () => {
    const currentSpeedElement = document.getElementById('current-speed');
    const gearElement = document.getElementById('gear');
    const greenBar = document.getElementById('green-bar');

    let speed = 71; // Mulai dari nilai di gambar
    let gear = 2;   // Mulai dari nilai di gambar
    let barValue = 100; // Asumsi bar hijau adalah 100%

    function updateSpeedometer() {
        // --- Simulasi Kecepatan ---
        // Target kecepatan acak (misalnya 0 hingga 150 KM/H)
        let targetSpeed = Math.floor(Math.random() * 150);
        
        // Perlambatan/akselerasi halus
        if (speed < targetSpeed) {
            speed = Math.min(targetSpeed, speed + 1);
        } else if (speed > targetSpeed) {
            speed = Math.max(0, speed - 2);
        }

        currentSpeedElement.textContent = Math.round(speed);

        // --- Simulasi Gear ---
        if (speed === 0) {
            gear = 'N';
        } else if (speed < 30) {
            gear = 1;
        } else if (speed < 60) {
            gear = 2;
        } else if (speed < 100) {
            gear = 3;
        } else if (speed < 140) {
            gear = 4;
        } else {
            gear = 5;
        }
        gearElement.textContent = gear;
        
        // --- Simulasi Bar Hijau (Asumsi Fuel/Health) ---
        // Bar akan berkurang secara perlahan
        barValue = Math.max(0, barValue - 0.1); 
        
        greenBar.style.width = `${barValue}%`;
        
        // Optional: Ganti warna bar jika rendah
        if (barValue < 20) {
            greenBar.style.backgroundColor = '#ff0000'; // Merah
        } else {
            greenBar.style.backgroundColor = '#00ff00'; // Hijau
        }
        
        // Jika barValue mencapai 0, reset simulasi
        if (barValue === 0) {
            barValue = 100;
        }
    }

    // Perbarui speedometer setiap 50ms untuk gerakan yang sangat halus
    setInterval(updateSpeedometer, 50); 
    
    // Inisialisasi awal
    updateSpeedometer();
});
