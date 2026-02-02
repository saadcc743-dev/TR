// TubeRadar Script - 2026 Enhanced Version
const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev"; 
let isPremium = false;

document.addEventListener('DOMContentLoaded', () => {
    // Initial data load
    loadHourlyHarvest();
    updateSavedUI();
    
    // Live User Counter Logic
    setInterval(() => {
        const c = 120 + Math.floor(Math.random() * 45);
        const counterEl = document.getElementById('liveCount');
        if(counterEl) counterEl.innerText = `● ${c} Scanning Now`;
    }, 9000);
});

// 1. Improved Harvest Loader
async function loadHourlyHarvest() {
    const container = document.getElementById('resultsContainer');
    const updateTag = document.getElementById('updateTag');
    
    container.innerHTML = '<div class="loading">🛰️ Connecting to Radar...</div>';
    
    try {
        const res = await fetch(`${WORKER_URL}?get_harvest=true&t=${Date.now()}`);
        if (!res.ok) throw new Error("Worker Response Error");
        
        const data = await res.json();
        
        // Handle Empty Database Case
        if (!data.niches || data.niches.length === 0) {
            updateTag.innerText = "LIVE (UPDATING)";
            updateTag.style.background = "#fdcb6e"; // Yellow badge
            container.innerHTML = `
                <div style="text-align:center; padding:20px;">
                    <p>Radar is online, but the database is empty.</p>
                    <button class="btn primary-btn" onclick="location.reload()">Refresh Data</button>
                </div>`;
            return;
        }

        // Handle Success Case
        updateTag.innerText = "LIVE";
        updateTag.style.background = "#00b894"; // Green badge
        renderResults(data.niches.map(n => [n]));

    } catch (e) { 
        console.error("Fetch failed:", e);
        updateTag.innerText = "OFFLINE";
        updateTag.style.background = "#ff7675"; // Red badge
        container.innerHTML = "<p style='color:red; text-align:center;'>Radar Connection Timeout. Please refresh.</p>"; 
    }
}

// 2. Main Search Logic
window.startSearch = async function() {
    const input = document.getElementById('keywordInput');
    const q = input.value.trim();
    if(!q) return;
    
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '<div class="loading">📡 Scanning YouTube Satellites...</div>';
    
    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        
        // Google Suggest API usually returns [query, [suggestions]]
        if (data && data[1] && data[1].length > 0) {
            renderResults(data[1].map(item => [item]));
        } else {
            container.innerHTML = "<p>No hits found. Try a broader keyword.</p>";
        }
    } catch (e) { 
        container.innerHTML = "<p style='color:red'>Scan Failed. Check your internet.</p>"; 
    }
}

// 3. Render Results
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    let foundEpic = false;

    list.forEach((item, i) => {
        const text = item[0];
        const words = text.split(' ').length;
        let grade = words >= 4 ? "A+" : (words >= 3 ? "B" : "C");
        const isLocked = (grade === "A+" && !isPremium && i > 3);

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div class="${isLocked ? 'premium-locked' : ''}">
                <strong style="cursor:pointer" onclick="document.getElementById('keywordInput').value='${text}';startSearch()">
                    ${isLocked ? '••••••••••••' : text}
                </strong>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
                <div class="score-circle grade-${grade[0]}">${grade}</div>
                ${!isLocked ? `<button onclick="saveGem('${text}')" class="save-btn">+</button>` : ''}
            </div>
        `;
        container.appendChild(div);
        if(grade === "A+" && !isLocked) foundEpic = true;
    });

    if(foundEpic && typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
}

// 4. Gem Management
function saveGem(t) {
    let g = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!g.includes(t)) {
        g.push(t);
        localStorage.setItem('trGems', JSON.stringify(g));
        updateSavedUI();
    }
}

function updateSavedUI() {
    const l = document.getElementById('alertsList');
    if(!l) return;
    const g = JSON.parse(localStorage.getItem('trGems') || "[]");
    l.innerHTML = g.map(x => `<div class="gem-item"><i class="fas fa-gem"></i> ${x}</div>`).join('');
}

// Ad Logic
window.showRewardedAd = function() {
    alert("Unlocking Premium Niches...");
    setTimeout(() => {
        isPremium = true;
        document.getElementById('unlockBtn').style.display = 'none';
        loadHourlyHarvest();
    }, 1500);
}
