// TubeRadar Pro - 2026 Final Version
const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev"; 
let isPremium = false;

document.addEventListener('DOMContentLoaded', () => {
    // Initial data load from Cloudflare KV
    loadHourlyHarvest();
    updateSavedUI();
    
    // Live Pulse Animation
    setInterval(() => {
        const c = 140 + Math.floor(Math.random() * 60);
        const counterEl = document.getElementById('liveCount');
        if(counterEl) counterEl.innerText = `● ${c} Radars Active`;
    }, 8000);
});

// 1. Load Trends (The list you see when you first open the tool)
async function loadHourlyHarvest() {
    const container = document.getElementById('resultsContainer');
    const updateTag = document.getElementById('updateTag');
    
    try {
        // Fetching from Worker with cache-buster
        const res = await fetch(`${WORKER_URL}?get_harvest=true&t=${Date.now()}`);
        if (!res.ok) throw new Error();
        
        const data = await res.json();
        
        if (data && data.niches && data.niches.length > 0) {
            updateTag.innerText = "LIVE";
            updateTag.style.background = "#00b894";
            renderResults(data.niches.map(n => [n]));
        } else {
            updateTag.innerText = "SYNCING";
            container.innerHTML = "<p style='text-align:center;'>Gathering 2026 data... Refresh in a moment.</p>";
        }
    } catch (e) { 
        updateTag.innerText = "OFFLINE";
        updateTag.style.background = "#ff7675";
        container.innerHTML = "<p style='color:red; text-align:center;'>Radar Offline. Check connection.</p>"; 
    }
}

// 2. Universal Search Logic (The Scan Button)
window.startSearch = async function() {
    const input = document.getElementById('keywordInput');
    const q = input.value.trim();
    if(!q) return;
    
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '<div style="text-align:center; padding:20px;">📡 Scanning Global Databases...</div>';
    
    try {
        // Use the Worker as a proxy to avoid CORS blocks
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}&cache=${Date.now()}`);
        const data = await res.json();
        
        // Google/Firefox Suggest format: [query, [suggestions]]
        if (data && Array.isArray(data[1]) && data[1].length > 0) {
            const formatted = data[1].map(item => [item]);
            renderResults(formatted);
        } else {
            container.innerHTML = "<p style='text-align:center; padding:20px;'>No new trends found for this keyword.</p>";
        }
    } catch (e) { 
        console.error("Search failed", e);
        container.innerHTML = "<p style='color:red; text-align:center;'>Scan Failed. Try again.</p>"; 
    }
}

// 3. UI Renderer
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    list.forEach((item, i) => {
        const text = item[0];
        const wordCount = text.split(' ').length;
        
        // Smart Grading: Longer phrases get better grades
        let grade = wordCount >= 4 ? "A+" : (wordCount >= 3 ? "B" : "C");
        
        // Locking Logic (Locks A+ results for non-premium users)
        const isLocked = (grade === "A+" && !isPremium && i > 2);

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div style="flex:1;">
                <span class="trend-text" style="${isLocked ? 'filter:blur(4px);' : ''}">
                    ${isLocked ? '••••••••••••••••' : text}
                </span>
                ${isLocked ? '<i class="fas fa-lock" style="margin-left:10px; color:#fdcb6e;"></i>' : ''}
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="score-circle grade-${grade[0]}">${grade}</div>
                ${!isLocked ? `<button onclick="saveGem('${text}')" class="save-btn"><i class="fas fa-plus"></i></button>` : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

// 4. Gem/Storage System
function saveGem(t) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(t)) {
        gems.push(t);
        localStorage.setItem('trGems', JSON.stringify(gems));
        updateSavedUI();
    }
}

function updateSavedUI() {
    const list = document.getElementById('alertsList');
    if(!list) return;
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    list.innerHTML = gems.map(x => `<div class="gem-item">💎 ${x}</div>`).join('');
}

// 5. Ad Interaction (Premium Unlock)
window.showRewardedAd = function() {
    const btn = document.getElementById('unlockBtn');
    btn.innerText = "Unlocking...";
    setTimeout(() => {
        isPremium = true;
        btn.style.display = 'none';
        alert("Premium Access Granted! Re-scanning...");
        loadHourlyHarvest();
    }, 2000);
}
