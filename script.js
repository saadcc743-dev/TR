// TubeRadar Final Logic - Connected to your Cloudflare Worker
const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev"; 
let isPremium = false;

document.addEventListener('DOMContentLoaded', () => {
    loadHourlyHarvest();
    updateSavedUI();
    
    // Live User Counter Simulation
    setInterval(() => {
        const c = 120 + Math.floor(Math.random() * 45);
        const counterEl = document.getElementById('liveCount');
        if(counterEl) counterEl.innerText = `● ${c} Scanning Now`;
    }, 9000);
});

// 1. Fetch the Hourly Trends from your Cloudflare KV
async function loadHourlyHarvest() {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '<div class="loading">🛰️ Harvesting live trends from YouTube...</div>';
    try {
        const res = await fetch(`${WORKER_URL}?get_harvest=true`);
        const data = await res.json();
        
        // Update the timestamp badge
        const updateTag = document.getElementById('updateTag');
        if(data.lastUpdated) {
            updateTag.innerText = `LIVE: ${new Date(data.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }
        
        renderResults(data.niches.map(n => [n]));
    } catch (e) { 
        container.innerHTML = "<p style='color:red'>Radar Connection Error. Check Worker URL.</p>"; 
    }
}

// 2. Main Search Function
window.startSearch = async function() {
    const input = document.getElementById('keywordInput');
    const q = input.value.trim();
    if(!q) return;
    
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '<div class="loading">📡 Scanning YouTube Satellites...</div>';
    
    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        renderResults(data[1]);
    } catch (e) { 
        container.innerHTML = "<p style='color:red'>Scan Failed. Please try again.</p>"; 
    }
}

// 3. Render Results with Premium Lock Logic
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    let foundEpic = false;

    if (!list || list.length === 0) {
        container.innerHTML = "<p>No hits found. Try a different seed keyword.</p>";
        return;
    }

    list.forEach((item, i) => {
        const text = item[0];
        const words = text.split(' ').length;
        
        // Grade Logic: 4+ words is A+
        let grade = words >= 4 ? "A+" : (words >= 3 ? "B" : "C");
        
        // Lock A+ niches after the 4th item if not Premium
        const isLocked = (grade === "A+" && !isPremium && i > 3);

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div class="${isLocked ? 'premium-locked' : ''}">
                <strong style="cursor:pointer" onclick="document.getElementById('keywordInput').value='${text}';startSearch()">
                    ${isLocked ? '••••••••••••••••' : text}
                </strong>
                <div style="font-size:10px; color:#888; margin-top:2px;">
                    ${isLocked ? 'Unlock to see niche' : words + ' word long-tail'}
                </div>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
                <div class="score-circle grade-${grade[0]}">${grade}</div>
                ${!isLocked ? `<button onclick="saveGem('${text}')" style="border:none;background:none;color:#6c5ce7;cursor:pointer;font-size:18px;">+</button>` : ''}
            </div>
        `;
        container.appendChild(div);
        
        if(grade === "A+" && !isLocked) foundEpic = true;
    });

    // Viral Confetti Effect for A+ Niches
    if(foundEpic && typeof confetti === 'function') {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }
}

// 4. Rewarded Ad Logic (Simulated for now)
window.showRewardedAd = function() {
    // Replace this alert with your Ad Network code later
    alert("Watching Ad to Unlock A+ Niches...");
    
    setTimeout(() => {
        isPremium = true;
        const unlockBtn = document.getElementById('unlockBtn');
        if(unlockBtn) unlockBtn.style.display = 'none';
        
        // Refresh to show blurred content
        loadHourlyHarvest();
        
        if(typeof confetti === 'function') {
            confetti({ particleCount: 200, spread: 100, colors: ['#ff7675', '#6c5ce7'] });
        }
    }, 2000);
}

// 5. Save & Export Gems Logic
function saveGem(t) {
    let g = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!g.includes(t)) {
        g.push(t);
        localStorage.setItem('trGems', JSON.stringify(g));
        updateSavedUI();
    }
}

function updateSavedUI() {
    const listEl = document.getElementById('alertsList');
    if(!listEl) return;
    const g = JSON.parse(localStorage.getItem('trGems') || "[]");
    
    if(g.length === 0) {
        listEl.innerHTML = '<p style="font-size:11px; color:#aaa; text-align:center;">No gems saved yet.</p>';
        return;
    }
    
    listEl.innerHTML = g.map(x => `
        <div style="font-size:11px; padding:8px; border-bottom:1px solid #eee; display:flex; justify-content:space-between;">
            <span><i class="fas fa-check" style="color:#00b894"></i> ${x}</span>
        </div>
    `).join('');
}

// 6. CSV Export
const exportBtn = document.getElementById('exportCsv');
if(exportBtn) {
    exportBtn.onclick = () => {
        const g = JSON.parse(localStorage.getItem('trGems') || "[]");
        if(g.length === 0) return alert("Save some niches first!");
        
        const csvContent = "data:text/csv;charset=utf-8," + ["Niche Keyword"].concat(g).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "tuberadar-gems.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Bind Enter Key to Search
const searchInput = document.getElementById('keywordInput');
if(searchInput) {
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            startSearch();
        }
    });
}

// Handle Search Button Click
const searchBtn = document.getElementById('searchBtn');
if(searchBtn) searchBtn.onclick = () => startSearch();
