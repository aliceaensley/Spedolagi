document.addEventListener('DOMContentLoaded', () => {
    const digitalSpeedDisplay = document.getElementById('digital-speed');
    const digitalSpeedSpans = digitalSpeedDisplay.querySelectorAll('span');
    const gearElement = document.getElementById('gear');
    const gaugeGreen = document.getElementById('gauge-green');

    let speed = 0; // Kecepatan/Rage
    let gear = 'N';

    function updateGauge(newSpeed) {
        // 1. Update Kecepatan Digital (2 kotak)
        const speedStr = newSpeed.toString().padStart(2, '0').slice(-2); // Pastikan 2 digit
        digitalSpeedSpans[0].textContent = speedStr[0];
        digitalSpeedSpans[1].textContent = speedStr[1];

        // 2. Update Gear (Kita hanya tampilkan 'N' di tengah, seperti gambar)
        if (newSpeed === 0) {
            gear = 'N';
        } else {
            // Untuk simulasi, kita biarkan gear 'N' di tengah jika kecepatannya > 0
            // Namun, jika ingin gear berubah, gunakan logika sebelumnya:
            // gear = newSpeed < 50 ? '1' : '2'; 
        }
        gearElement.textContent = gear;

        // 3. Update Bar RPM/RAGE (Hijau)
        const maxRage = 180; 
        let percentage = Math.min(1, newSpeed / maxRage);
        let arcPercentage = percentage * 50; 

        // Batasi arc hijau agar tidak masuk zona kuning/merah
        if (newSpeed > 140) { // Anggap 140 batas hijau
            arcPercentage = (140 / maxRage) * 50;
        }
        
        gaugeGreen.style.setProperty('--progress-deg', `${arcPercentage}%`);
    }

    // --- Simulasi Pergerakan ---
    let targetSpeed = 0;
    
    function accelerate() {
        targetSpeed = Math.floor(Math.random() * 160) + 10; 
    }

    function decelerate() {
        targetSpeed = Math.floor(Math.random() * 20);
    }

    setInterval(() => {
        // Perpindahan halus menuju target
        if (speed < targetSpeed) {
            speed = Math.min(targetSpeed, speed + 2);
        } else if (speed > targetSpeed) {
            speed = Math.max(0, speed - 3);
        }

        updateGauge(speed);
    }, 50); 

    // Ganti Target Speed setiap beberapa detik
    setInterval(() => {
        if (Math.random() > 0.5) {
            accelerate();
        } else {
            decelerate();
        }
    }, 4000);

    // Inisialisasi awal
    updateGauge(0);
});
