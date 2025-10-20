// ... (Variabel Global sama) ...
let elements = {};
let speedMode = 1; 
let indicators = 0;

const onOrOff = state => state ? 'On' : 'Off';

// ... (Fungsi setEngine, setSpeed, setRPM, setGear, setHeadlights, setSeatbelts, setSpeedMode sama) ...

/** Mengupdate bar dan persentase bahan bakar. */
function setFuel(fuel_01) {
    const fuel_100 = Math.max(0, Math.min(100, fuel_01 * 100));

    // Memperbarui bar visual
    document.getElementById('fuel-fill').style.height = `${Math.round(fuel_100)}%`;
    
    // MEMPERBARUI NILAI PERSENTASE DI BAGIAN ATAS
    document.getElementById('fuel-percent').textContent = `${Math.round(fuel_100)}%`; 

    // Memperbarui nilai mentah di elemen tersembunyi
    elements.fuel.innerText = `${fuel_100.toFixed(1)}%`;
}

/** Mengupdate bar dan persentase kesehatan. */
function setHealth(health_01) {
    const health_100 = Math.max(0, Math.min(100, health_01 * 100));
    
    // Memperbarui bar visual
    const healthFill = document.getElementById('health-fill');
    healthFill.style.height = `${Math.round(health_100)}%`;
    
    // MEMPERBARUI NILAI PERSENTASE DI BAGIAN ATAS
    document.getElementById('health-percent').textContent = `${Math.round(health_100)}%`; 
    
    // Mengubah warna bar visual berdasarkan kesehatan
    if (health_100 < 30) {
        healthFill.style.backgroundColor = '#ff0000'; 
    } else if (health_100 < 60) {
        healthFill.style.backgroundColor = '#ffff00'; 
    } else {
        healthFill.style.backgroundColor = '#00ff00'; 
    }

    // Memperbarui nilai mentah di elemen tersembunyi
    elements.health.innerText = `${health_100.toFixed(1)}%`;
}

// ... (Fungsi controlIndicators, setLeftIndicator, setRightIndicator sama) ...

// ... (DOM Content Loaded listener sama) ...

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi 'elements' agar semua fungsi setter asli Anda bekerja
    elements = {
        // ... (ID lama sama) ...
        health: document.getElementById('health'),
        fuel: document.getElementById('fuel'),
        
        // Memastikan elemen visual persentase ada
        'health-percent': document.getElementById('health-percent'),
        'fuel-percent': document.getElementById('fuel-percent'),
        
        // Memastikan elemen visual bar ada
        'dashboard-box': document.getElementById('dashboard-box'),
        'health-fill': document.getElementById('health-fill'),
        'fuel-fill': document.getElementById('fuel-fill'),
    };
    // ... (Window Listener dan updateUI awal sama) ...
});
