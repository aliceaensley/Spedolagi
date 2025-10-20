document.addEventListener('DOMContentLoaded', () => {
    // Ambil elemen-elemen penting
    const toggleYoutubeBtn = document.getElementById('toggle-youtube-btn');
    const hideYoutubeBtn = document.getElementById('hide-youtube-btn');
    const youtubeHeadunit = document.getElementById('youtube-headunit');

    // Fungsionalitas untuk menampilkan Headunit
    toggleYoutubeBtn.addEventListener('click', () => {
        youtubeHeadunit.classList.remove('hidden');
        // Pilihan: Sembunyikan tombol toggle saat headunit terbuka
        toggleYoutubeBtn.style.display = 'none';
    });

    // Fungsionalitas untuk menyembunyikan Headunit
    hideYoutubeBtn.addEventListener('click', () => {
        youtubeHeadunit.classList.add('hidden');
        // Tampilkan kembali tombol toggle
        toggleYoutubeBtn.style.display = 'block';
    });

    // Simulasi perubahan data Speedometer (Opsional)
    const currentSpeedElement = document.getElementById('current-speed');
    const gearElement = document.getElementById('gear');

    let speed = 120;
    let gear = '4';

    function updateSpeedometer() {
        // Contoh: Kecepatan berubah secara acak (simulasi)
        speed = Math.floor(Math.random() * (180 - 80 + 1)) + 80;
        
        // Contoh: Gear berubah berdasarkan kecepatan
        if (speed < 10) {
            gear = 'N';
        } else if (speed < 40) {
            gear = '1';
        } else if (speed < 70) {
            gear = '2';
        } else if (speed < 100) {
            gear = '3';
        } else {
            gear = '4';
        }

        currentSpeedElement.textContent = speed;
        gearElement.textContent = gear;
    }

    // Perbarui speedometer setiap 2 detik (simulasi)
    setInterval(updateSpeedometer, 2000);
});
