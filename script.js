// =======================================================
// VARIABEL GLOBAL & KONFIGURASI NUI
// =======================================================
let elements = {};
let speedMode = 1; 
let indicators = 0;
let isCustomHeadUnitVisible = false; 
let blinkInterval;
let lastIndicatorState = 0;

// ⚠️ GANTI 'resource_name' DENGAN NAMA FOLDER RESOURCE FIVEM ANDA
const NUI_RESOURCE_NAME = 'resource_name'; 

// Data hasil pencarian awal (HANYA DIGUNAKAN UNTUK FALLBACK DEMO jika API gagal)
const INITIAL_YOUTUBE_RESULTS = [
    { title: "KUMPULAN LAGU HITS SPOTIFY TIKTOK VIRAL", channel_name: "StarHits Music", external_video_id: "FWn30lNyVhc" },
    { title: "LAGU POP GALAU AKUSTIK TERBAIK", channel_name: "Agus Riansyah74", external_video_id: "O-dRQtArLgs" },
    { title: "REVIEW MOBIL TERBARU", channel_name: "Otomotif Channel", external_video_id: "jL-G6eE2Fss" }
];


// =======================================================
// FUNGSI UTILITY YOUTUBE (INTEGRASI NUI)
// =======================================================

/**
 * Mengirim query pencarian ke backend (Lua/C#) yang akan memanggil YouTube API.
 * @param {string} query Query pencarian YouTube.
 */
async function loadYoutubeResults(query = "Musik Populer Indonesia") {
    const contentDiv = document.getElementById('youtube-content');
    contentDiv.innerHTML = `<p style="text-align: center; color: #00ffff; margin-top: 50px;">⏳ Mencari video nyata untuk: ${query}...</p>`;

    try {
        // Panggilan fetch ke endpoint NUI yang ditangani oleh file Lua (backend)
        const response = await fetch(`https://${NUI_RESOURCE_NAME}/youtubeSearch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        
        const results = await response.json();
        
        if (!response.ok || !Array.isArray(results) || results.length === 0) {
            console.error("NUI fetch gagal atau hasil kosong. Memeriksa API Key/Backend.");
            throw new Error("Gagal memuat hasil nyata dari server.");
        }
        
        displayYoutubeResults(results);
        
    } catch (error) {
        console.error('Error NUI fetch. Menggunakan data awal:', error);
        contentDiv.innerHTML = '<p style="text-align: center; color: #ff6666; margin-top: 50px;">❌ Gagal memuat dari API. Menampilkan hasil default.</p>';
        displayYoutubeResults(INITIAL_YOUTUBE_RESULTS); 
    }
}


/**
 * Menampilkan layar Head Unit aplikasi YouTube
 */
function openYoutubeApp() {
    document.getElementById('app-home-screen').style.display = 'none';
    document.getElementById('youtube-screen').style.display = 'flex';
    document.getElementById('headunit-status-bar').style.display = 'none'; 
    
    // Muat hasil saat aplikasi dibuka (default query)
    loadYoutubeResults(); 
}

/**
 * Menutup layar aplikasi YouTube dan kembali ke Home Screen
 */
function closeYoutubeApp() {
    document.getElementById('youtube-screen').style.display = 'none';
    document.getElementById('app-home-screen').style.display = 'grid';
    document.getElementById('headunit-status-bar').style.display = 'flex'; 
    
    document.getElementById('youtube-content').innerHTML = '<p style="text-align: center; color: #aaa; margin-top: 50px;">Cari sesuatu untuk mulai memutar video...</p>';
}

/**
 * Menghasilkan HTML untuk daftar hasil video dari data yang diterima.
 */
function displayYoutubeResults(results) {
    const contentDiv = document.getElementById('youtube-content');
    contentDiv.innerHTML = ''; 

    if (!results || results.length === 0) {
        contentDiv.innerHTML = '<p style="text-align: center; color: #aaa; margin-top: 50px;">Tidak ada hasil ditemukan.</p>';
        return;
    }

    results.forEach(video => {
        const item = document.createElement('div');
        item.classList.add('video-item');
        const videoId = video.external_video_id; 
        
        item.innerHTML = `
            <img src="https://img.youtube.com/vi/${videoId}/default.jpg" class="video-thumb" alt="Thumbnail">
            <div class="video-details">
                <div class="video-title">${video.title}</div>
                <div class="video-channel">${video.channel_name}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            playVideo(videoId);
        });
        
        contentDiv.appendChild(item);
    });
}

/**
 * Memutar video yang dipilih dalam iframe
 */
function playVideo(videoId) {
    const contentDiv = document.getElementById('youtube-content');
    contentDiv.innerHTML = `
        <iframe 
            class="video-player-iframe" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
        ></iframe>
    `;
}

/**
 * Memicu pencarian YouTube menggunakan query dari input.
 */
function searchYoutube() {
    const inputElement = document.getElementById('youtube-search-input');
    const query = inputElement.value.trim();
    
    if (query.length === 0) {
        alert("Masukkan kata kunci pencarian.");
        return;
    }
    
    loadYoutubeResults(query);
}


// =======================================================
// FUNGSI KONTROL DASHBOARD & HEAD UNIT (SETTER)
// =======================================================

function setEngine(state) {
    const engineIcon = document.getElementById('engine-icon');
    if (engineIcon) engineIcon.classList.toggle('active', state);
}

function setSpeed(speed_ms) {
    let speedDisplay;
    switch(speedMode) {
        case 1: speedDisplay = Math.round(speed_ms * 2.236936); break; 
        case 2: speedDisplay = Math.round(speed_ms * 1.943844); break; 
        default: speedDisplay = Math.round(speed_ms * 3.6); 
    }
    if (elements.speed) elements.speed.innerText = speedDisplay; 
    
    const maxDots = 4;
    let scaleMax = speedMode === 1 ? 120 : 180; 
    let powerLevel = Math.min(maxDots, Math.ceil(speedDisplay / (scaleMax / maxDots))); 
    const powerDots = document.querySelectorAll('.power-bar-dots .dot');
    powerDots.forEach((dot, index) => {
        dot.classList.toggle('active', index < powerLevel);
    });
}

function setRPM(rpm) { /* ... */ }

function setFuel(fuel_01) {
    const fuel_100 = Math.max(0, Math.min(100, fuel_01 * 100));
    const fuelPercentElement = document.getElementById('fuel-percent');
    const fuelFill = document.getElementById('fuel-fill');
    if (fuelFill) fuelFill.style.height = `${Math.round(fuel_100)}%`;
    if (fuelPercentElement) fuelPercentElement.textContent = `${Math.round(fuel_100)}%`; 
}

function setHealth(health_01) {
    const health_100 = Math.max(0, Math.min(100, health_01 * 100));
    const healthFill = document.getElementById('health-fill');
    const healthPercentElement = document.getElementById('health-percent');
    if (healthFill) {
        healthFill.style.height = `${Math.round(health_100)}%`;
        healthFill.style.backgroundColor = health_100 < 30 ? '#ff0000' : (health_100 < 60 ? '#ffff00' : '#00ff00'); 
    }
    if (healthPercentElement) healthPercentElement.textContent = `${Math.round(health_100)}%`; 
}

function setGear(gear) {
    const gearElement = document.getElementById('gear');
    if (!gearElement) return;
    let displayGear = String(gear).toUpperCase();
    if (displayGear === '0') displayGear = 'N'; 
    if (displayGear.length > 1 && displayGear.match(/[A-Z]/i)) { 
        displayGear = displayGear[0];
    }
    gearElement.innerText = displayGear;
    gearElement.style.color = (displayGear === 'R' || displayGear === 'N') ? '#ff0000' : '#fff'; 
}

function setHeadlights(state) {
    const headlightsIcon = document.getElementById('headlights-icon');
    let displayOn = state === 1 || state === 2; 
    if (headlightsIcon) headlightsIcon.classList.toggle('active', displayOn);
}

function controlIndicators(state) {
    const turnLeft = document.getElementById('turn-left-icon'); 
    const turnRight = document.getElementById('turn-right-icon'); 
    if (state !== lastIndicatorState) {
        clearInterval(blinkInterval);
        if (turnLeft) turnLeft.classList.remove('active');
        if (turnRight) turnRight.classList.remove('active');
        if (state === 1) { 
            blinkInterval = setInterval(() => { if(turnLeft) turnLeft.classList.toggle('active'); }, 250);
        } else if (state === 2) { 
            blinkInterval = setInterval(() => { if(turnRight) turnRight.classList.toggle('active'); }, 250);
        } else if (state === 3) { 
             blinkInterval = setInterval(() => { 
                if(turnLeft) turnLeft.classList.toggle('active');
                if(turnRight) turnRight.classList.toggle('active');
             }, 250);
        }
    }
    lastIndicatorState = state;
}

function setLeftIndicator(state) {
    indicators = (indicators & 0b10) | (state ? 0b01 : 0b00); 
    controlIndicators(indicators);
}

function setRightIndicator(state) {
    indicators = (indicators & 0b01) | (state ? 0b10 : 0b00); 
    controlIndicators(indicators);
}

function setSeatbelts(state) {
    const seatbeltIcon = document.getElementById('abs-icon');
    if (seatbeltIcon) seatbeltIcon.classList.toggle('active', state); 
}

function setSpeedMode(mode) {
    speedMode = mode;
    const speedModeElement = document.getElementById('speed-mode');
    if (!speedModeElement) return;
    speedModeElement.innerText = (mode === 1) ? 'MPH' : ((mode === 2) ? 'Knots' : 'KMH');
}

function toggleHeadUnitVisibility() {
    const button = document.getElementById('toggle-game-hud-button');
    const headUnitContainer = document.getElementById('custom-headunit-container'); 
    if (!headUnitContainer) return;

    isCustomHeadUnitVisible = !isCustomHeadUnitVisible;
    
    if (isCustomHeadUnitVisible) {
        button.classList.remove('hidden');
        headUnitContainer.style.display = 'flex'; 
    } else {
        button.classList.add('hidden');
        headUnitContainer.style.display = 'none'; 
        closeYoutubeApp(); 
    }
}


// =======================================================
// FUNGSI UTAMA PENGHUBUNG (NUI LISTENER)
// =======================================================

const updateUI = (data) => {
    const dashboardBox = document.getElementById('dashboard-box');
    dashboardBox.style.opacity = '1'; 
    dashboardBox.style.visibility = 'visible'; 

    if (data.engine !== undefined) setEngine(data.engine);
    if (data.speed !== undefined) setSpeed(data.speed);
    if (data.rpm !== undefined) setRPM(data.rpm);
    if (data.fuel !== undefined) setFuel(data.fuel);
    if (data.health !== undefined) setHealth(data.health);
    if (data.gear !== undefined) setGear(data.gear);
    if (data.headlights !== undefined) setHeadlights(data.headlights); 
    if (data.seatbelts !== undefined) setSeatbelts(data.seatbelts); 
    if (data.speedMode !== undefined) setSpeedMode(data.speedMode);
    if (data.leftIndicator !== undefined) setLeftIndicator(data.leftIndicator);
    if (data.rightIndicator !== undefined) setRightIndicator(data.rightIndicator);
};


document.addEventListener('DOMContentLoaded', () => {
    // INISIALISASI ELEMENTS
    elements.speed = document.getElementById('speed'); 
    elements.gear = document.getElementById('gear');
    elements.speedMode = document.getElementById('speed-mode');


    const toggleGameHudButton = document.getElementById('toggle-game-hud-button');
    if (toggleGameHudButton) {
        toggleGameHudButton.addEventListener('click', toggleHeadUnitVisibility); 
    }
    
    // INISIALISASI EVENT LISTENER YOUTUBE
    const youtubeAppIcon = document.getElementById('youtube-app-icon');
    const youtubeCloseBtn = document.getElementById('youtube-close-btn');
    const youtubeSearchBtn = document.getElementById('youtube-search-btn');
    const youtubeSearchInput = document.getElementById('youtube-search-input');

    if (youtubeAppIcon) {
        youtubeAppIcon.addEventListener('click', openYoutubeApp);
    }
    if (youtubeCloseBtn) {
        youtubeCloseBtn.addEventListener('click', closeYoutubeApp);
    }
    if (youtubeSearchBtn) {
        youtubeSearchBtn.addEventListener('click', searchYoutube);
    }
    if (youtubeSearchInput) {
        youtubeSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchYoutube();
            }
        });
    }

    // INISIALISASI STATUS AWAL HEAD UNIT TAMBAHAN (SEMBUNYI)
    const headUnitContainer = document.getElementById('custom-headunit-container');
    if (headUnitContainer) {
        headUnitContainer.style.display = 'none'; 
    }
    if (toggleGameHudButton) {
        toggleGameHudButton.classList.add('hidden');
    }

    // Panggil updateUI sekali untuk nilai awal (Demo)
    updateUI({ 
        speed: 0, health: 1, fuel: 0.87, gear: 'R', headlights: 0, engine: false, seatbelts: true, 
        leftIndicator: false, rightIndicator: false, speedMode: 1
    });
});
