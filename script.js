// =======================================================
// VARIABEL GLOBAL & KONFIGURASI NUI
// =======================================================
let elements = {};
let speedMode = 1; 
let indicators = 0;
let isCustomHeadUnitVisible = false; 
let blinkInterval;
let lastIndicatorState = 0;

// ⚠️ GANTI INI DENGAN NAMA FOLDER RESOURCE FIVEM ANDA
const NUI_RESOURCE_NAME = 'resource_name'; 

// Data hasil pencarian awal (HANYA DIGUNAKAN UNTUK FALLBACK DEMO)
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
        // Panggilan fetch ke endpoint NUI
        const response = await fetch(`https://${NUI_RESOURCE_NAME}/youtubeSearch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        
        const results = await response.json();
        
        if (!response.ok || !Array.isArray(results) || results.length === 0) {
            // Ini akan terpicu jika API Key salah, resource_name salah, atau tidak ada hasil
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


// --- FUNGSI SETTER DASHBOARD (setEngine, setSpeed, setFuel, dll.) TIDAK BERUBAH DAN DIHILANGKAN DARI SINI UNTUK KERINGKASAN ---

// (Semua fungsi setter dashboard yang ada di respons sebelumnya HARUS tetap ada di script.js Anda)

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

    // Panggil updateUI sekali untuk nilai awal
    -- updateUI({...}); --
});
