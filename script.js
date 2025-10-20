document.addEventListener('DOMContentLoaded', () => {
    // Ambil elemen-elemen penting
    const toggleYoutubeBtn = document.getElementById('toggle-youtube-btn');
    const hideYoutubeBtn = document.getElementById('hide-youtube-btn');
    const youtubeHeadunit = document.getElementById('youtube-headunit');

    // Fungsionalitas untuk menampilkan Headunit
    toggleYoutubeBtn.addEventListener('click', () => {
        youtubeHeadunit.classList.remove('hidden');
        // Sembunyikan tombol toggle saat headunit terbuka
        toggleYoutubeBtn.style.opacity = '0';
        toggleYoutubeBtn.style.pointerEvents = 'none';
    });

    // Fungsionalitas untuk menyembunyikan Headunit
    hideYoutubeBtn.addEventListener('click', () => {
        youtubeHeadunit.classList.add('hidden');
        // Tampilkan kembali tombol toggle
        toggleYoutubeBtn.style.opacity = '1';
        toggleYoutubeBtn.style.pointerEvents = 'auto';
    });

    // --- Simulasi Data Speedometer ---
    const currentSpeedElement = document.getElementById('current-speed');
    const gearElement = document.getElementById('gear');

    let speed = 126; // Mulai dari nilai di gambar
    let gear = '4';

    function updateSpeedometer() {
        // Simulasi perubahan kecepatan: +/- 5 setiap detik
        const change = Math.floor(Math.random() * 11) - 5; 
        speed = Math.max(0, speed + change); // Pastikan kecepatan tidak negatif

        // Simulasi perubahan Gear (Sederhana)
        if (speed === 0) {
            gear = 'N';
        } else if (speed < 30) {
            gear = '1';
        } else if (speed < 60) {
            gear = '2';
        } else if (speed < 100) {
            gear = '3';
        } else if (speed < 150) {
            gear = '4';
        } else {
            gear = '5';
        }

        currentSpeedElement.textContent = speed.toString().padStart(3, '0').slice(-3); // Memastikan 3 digit
        gearElement.textContent = gear;
    }

    // Perbarui speedometer setiap 1 detik
    setInterval(updateSpeedometer, 1000);
    updateSpeedometer(); // Panggil sekali untuk inisialisasi
});
