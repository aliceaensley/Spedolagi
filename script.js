document.addEventListener('DOMContentLoaded', () => {
    const digitalSpeedDisplay = document.getElementById('digital-speed');
    const digitalSpeedSpans = digitalSpeedDisplay.querySelectorAll('span');
    const gearElement = document.getElementById('gear');
    const gaugeGreen = document.getElementById('gauge-green');

    let speed = 0; // Kecepatan/Rage
    let gear = 'N';

    function updateGauge(newSpeed) {
        // 1. Update Kecepatan Digital (3 kotak)
        const speedStr = newSpeed.toString().padStart(3, '0');
        digitalSpeedSpans[0].textContent = speedStr[0] === '0' ? '' : speedStr[0];
        digitalSpeedSpans[1].textContent = speedStr[1];
        digitalSpeedSpans[2].textContent = speedStr[2];

        // 2. Update Gear
        if (newSpeed < 10) {
            gear = 'N';
        } else if (newSpeed < 30) {
            gear = '1';
        } else if (newSpeed < 60) {
            gear = '2';
        } else if (newSpeed < 90) {
            gear = '3';
        } else if (newSpeed < 120) {
            gear = '4';
        } else if (newSpeed < 150) {
            gear = '5';
        } else if (newSpeed < 190) {
            gear = '6';
        } else {
            gear = '7'; // Anggap Max Speed/RAGE
        }
        gearElement.textContent = gear;

        // 3. Update Bar RPM/RAGE (Hijau)
        // Gauge bergerak dari 0% (kiri bawah) hingga ~85% (kanan atas)
        const maxRage = 220; // Batas simulasi
        // Hitung persentase dari 0 hingga 50% untuk mewakili arc penuh
        let percentage = Math.min(1, newSpeed / maxRage);
        let arcPercentage = percentage * 50; // Arc penuh di CSS adalah 50%

        // Pastikan tidak melewati zona merah/kuning (contoh)
        if (newSpeed > 170) {
            arcPercentage = 50; // Maksimal di zona hijau/kuning
        }
        
        gaugeGreen.style.setProperty('--progress-deg', `${arcPercentage}%`);
    }

    // --- Simulasi Pergerakan ---
    let targetSpeed = 0;
    
    function accelerate() {
        // Simulasikan akselerasi acak
        targetSpeed = Math.floor(Math.random() * 200) + 20; 
    }

    function decelerate() {
        // Simulasikan deselerasi acak
        targetSpeed = Math.floor(Math.random() * 50);
    }

    setInterval(() => {
        // Perpindahan halus menuju target
        if (speed < targetSpeed) {
            speed = Math.min(targetSpeed, speed + 3);
        } else if (speed > targetSpeed) {
            speed = Math.max(0, speed - 5);
        }

        updateGauge(speed);
    }, 50); // Update sangat cepat untuk gerakan halus

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
