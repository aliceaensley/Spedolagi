document.addEventListener('DOMContentLoaded', () => {
    const currentSpeedElement = document.getElementById('current-speed');
    const gearElement = document.getElementById('gear');
    const healthBar = document.getElementById('health-bar');

    let speed = 0;
    let gear = 'N';
    let health = 100; // Mulai dari 100%

    function updateSpeedometer() {
        // 1. Simulasi Perubahan Kecepatan (0 - 200)
        // Gunakan target speed untuk simulasi yang lebih realistis
        let targetSpeed = Math.floor(Math.random() * 180);
        
        // Perlambat perubahan untuk simulasi akselerasi/deselerasi
        if (speed < targetSpeed) {
            speed = Math.min(targetSpeed, speed + 5);
        } else if (speed > targetSpeed) {
            speed = Math.max(0, speed - 8);
        }

        currentSpeedElement.textContent = speed;

        // 2. Update Gear (Simpel)
        if (speed === 0) {
            gear = 'N';
        } else if (speed < 40) {
            gear = '1';
        } else if (speed < 80) {
            gear = '2';
        } else if (speed < 130) {
            gear = '3';
        } else {
            gear = '4';
        }
        gearElement.textContent = gear;
    }

    function updateHealthBar() {
        // Simulasi perubahan Health/Bar Hijau
        // Health akan berkurang dan bertambah secara acak
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, atau 1
        health = Math.max(0, Math.min(100, health + change));
        
        // Atur lebar bar dan warna jika di bawah ambang batas
        healthBar.style.width = `${health}%`;
        
        if (health < 30) {
            healthBar.style.backgroundColor = '#ff0000'; // Merah
        } else if (health < 60) {
            healthBar.style.backgroundColor = '#ffff00'; // Kuning
        } else {
            healthBar.style.backgroundColor = '#00ff00'; // Hijau
        }
    }

    // Perbarui speedometer setiap 100ms untuk gerakan halus
    setInterval(updateSpeedometer, 100);
    // Perbarui bar kesehatan lebih lambat
    setInterval(updateHealthBar, 1000); 
    
    // Panggil inisialisasi
    updateSpeedometer();
    updateHealthBar();
});
