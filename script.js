const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
const ALLOWED_DOMAINS = ["saadcc743-dev.github.io", "yourblog.blogspot.com"]; 
let isPremium = false;

// 1. Domain Lock & Kill Switch
(function() {
    const host = window.location.hostname;
    if (!ALLOWED_DOMAINS.some(d => host.includes(d))) {
        const app = document.getElementById('mainApp');
        const lock = document.getElementById('lockScreen');
        if(app) app.style.display = 'none';
        if(lock) lock.style.display = 'block';
        throw new Error("Unauthorized Domain");
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    loadHourlyHarvest();
    updateSavedUI();
    // Live Pulse Simulation
    setInterval(() => {
        const count = 120 + Math.floor(Math.random() * 40);
        const liveEl = document.getElementById('liveCount');
        if(liveEl) liveEl.innerText = `● ${count} Radars Active`;
    }, 8000);
});

// 2. Fetch Initial Trends (With Error Handling)
async function loadHourlyHarvest() {
    const tag = document.getElementById('updateTag');
    try {
        const res = await fetch(`${WORKER_URL}?get_harvest=true&t=${Date.now()}`);
        const data = await res.json();
        if (data && data.niches) {
            if(tag) { tag.innerText = "LIVE"; tag.style.background = "#00b894"; }
            renderResults(data.niches.map(n => [n]));
        }
    } catch (e) { if(tag) tag.innerText = "OFFLINE"; }
}

// 3. Optimized Search Logic with LOCAL CACHING
window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value.trim().toLowerCase();
    if(!q) return;

    const container = document.getElementById('resultsContainer');
    container.innerHTML = `<div class="radar-loader"><div class="radar-circle"></div><div style="margin-top:15px; font-size:0.8rem; color:#00b894; font-weight:bold;">SCANNING SATELLITES...</div></div>`;
    
    // --- CACHE CHECK (Saves API Quota) ---
    const cacheKey = `tr_cache_${q}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        const parsed = JSON.parse(cachedData);
        // If data is less than 12 hours old, use it instantly
        if (Date.now() - parsed.timestamp < 43200000) {
            console.log("Loading from Satellite Cache...");
            setTimeout(() => renderResults(parsed.data.map(item => [item])), 400);
            return;
        }
    }

    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data && data[1]) {
            // Save to Cache for 12 hours
            const cachePayload = { timestamp: Date.now(), data: data[1] };
            localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
            
            setTimeout(() => renderResults(data[1].map(item => [item])), 800);
        }
    } catch (e) { 
        container.innerHTML = "<p style='color:#ff7675;'>Satellite Link Interrupted. Try again.</p>"; 
    }
}

// 4. Render Results (Improved UX)
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    if(!container) return;
    container.innerHTML = '';
    
    list.forEach((item, i) => {
        const text = item[0];
        // 2026 Grading Logic
        const words = text.split(' ').length;
        const grade = words >= 4 ? "A+" : (words >= 3 ? "B" : "C");
        const isLocked = (grade === "A+" && !isPremium && i > 2);
        
        const trendIcon = grade === "A+" ? 
            '<span class="trend-meta trend-up"><i class="fas fa-arrow-trend-up"></i> HOT</span>' : 
            '<span class="trend-meta trend-new">STABLE</span>';

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div style="flex:1; display:flex; align-items:center; gap:10px;">
                <span style="${isLocked ? 'filter:blur(5px); opacity:0.5;' : ''}">${isLocked ? 'PREMIUM NICHE' : text}</span>
                ${trendIcon}
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="score-circle grade-${grade[0]}">${grade}</div>
                ${!isLocked ? `<button class="save-btn" onclick="saveGem('${text}')" title="Save to Research">+</button>` : `<button onclick="showRewardedAd()" class="lock-btn"><i class="fas fa-lock"></i></button>`}
            </div>
        `;
        container.appendChild(div);
    });
}

// 5. Gem Management & Export
window.saveGem = function(t) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(t)) { 
        gems.push(t); 
        localStorage.setItem('trGems', JSON.stringify(gems)); 
        updateSavedUI(); 
    }
}

window.removeGem = function(t) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]").filter(g => g !== t);
    localStorage.setItem('trGems', JSON.stringify(gems));
    updateSavedUI();
}

function updateSavedUI() {
    const list = document.getElementById('alertsList');
    if(!list) return;
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    list.innerHTML = gems.length ? gems.map(x => `
        <div class="saved-gem-item">
            <span>💎 ${x}</span>
            <i class="fas fa-trash-can" onclick="removeGem('${x}')"></i>
        </div>
    `).reverse().join('') : '<p style="font-size:0.75rem; color:#666; text-align:center;">No gems saved yet.</p>';
}

window.exportCSV = function() {
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.length) return alert("Save some niches first!");
    const csvContent = "data:text/csv;charset=utf-8,Niche Research List\n" + gems.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tuberadar_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
}

window.showRewardedAd = function() { 
    // This is the trigger for your AdSense Rewarded Ad integration
    const conf = confirm("Watch a short ad to unlock A+ Premium results?");
    if(conf) {
        alert("Premium Access Granted for this session!"); 
        isPremium = true; 
        startSearch(); 
    }
}
}

// 4. Render Results (Improved UX)
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    if(!container) return;
    container.innerHTML = '';
    
    list.forEach((item, i) => {
        const text = item[0];
        // 2026 Grading Logic
        const words = text.split(' ').length;
        const grade = words >= 4 ? "A+" : (words >= 3 ? "B" : "C");
        const isLocked = (grade === "A+" && !isPremium && i > 2);
        
        const trendIcon = grade === "A+" ? 
            '<span class="trend-meta trend-up"><i class="fas fa-arrow-trend-up"></i> HOT</span>' : 
            '<span class="trend-meta trend-new">STABLE</span>';

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div style="flex:1; display:flex; align-items:center; gap:10px;">
                <span style="${isLocked ? 'filter:blur(5px); opacity:0.5;' : ''}">${isLocked ? 'PREMIUM NICHE' : text}</span>
                ${trendIcon}
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="score-circle grade-${grade[0]}">${grade}</div>
                ${!isLocked ? `<button class="save-btn" onclick="saveGem('${text}')" title="Save to Research">+</button>` : `<button onclick="showRewardedAd()" class="lock-btn"><i class="fas fa-lock"></i></button>`}
            </div>
        `;
        container.appendChild(div);
    });
}

// 5. Gem Management & Export
window.saveGem = function(t) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(t)) { 
        gems.push(t); 
        localStorage.setItem('trGems', JSON.stringify(gems)); 
        updateSavedUI(); 
    }
}

window.removeGem = function(t) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]").filter(g => g !== t);
    localStorage.setItem('trGems', JSON.stringify(gems));
    updateSavedUI();
}

function updateSavedUI() {
    const list = document.getElementById('alertsList');
    if(!list) return;
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    list.innerHTML = gems.length ? gems.map(x => `
        <div class="saved-gem-item">
            <span>💎 ${x}</span>
            <i class="fas fa-trash-can" onclick="removeGem('${x}')"></i>
        </div>
    `).reverse().join('') : '<p style="font-size:0.75rem; color:#666; text-align:center;">No gems saved yet.</p>';
}

window.exportCSV = function() {
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.length) return alert("Save some niches first!");
    const csvContent = "data:text/csv;charset=utf-8,Niche Research List\n" + gems.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tuberadar_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
}

window.showRewardedAd = function() { 
    // This is the trigger for your AdSense Rewarded Ad integration
    const conf = confirm("Watch a short ad to unlock A+ Premium results?");
    if(conf) {
        alert("Premium Access Granted for this session!"); 
        isPremium = true; 
        startSearch(); 
    }
}

        // Always blur A+ results for non-premium users
        const isLocked = (grade === "A+" && !window.isPremium);

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div style="flex:1;">
                <div style="font-size:0.6rem; font-weight:bold; color:var(--primary); margin-bottom:5px;">
                    ${grade === 'A+' ? '★ EXPLODING NICHE' : 'MARKET STABLE'}
                </div>
                <div class="${isLocked ? 'premium-blur' : ''}" style="font-weight:700; font-size:1rem; color:white;">
                    ${isLocked ? 'HIDDEN PREMIUM DATA' : item}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="score-circle grade-${grade.charAt(0)}">${grade}</div>
                ${isLocked ? 
                    `<button onclick="window.unlockPremium()" class="lock-btn"><i class="fas fa-lock"></i></button>` : 
                    `<button class="save-btn" onclick="window.saveGem('${item}')" style="background:rgba(255,255,255,0.05); border:1px solid #444; color:white; width:38px; height:38px; border-radius:10px; cursor:pointer;">+</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

window.unlockPremium = function() {
    if(confirm("Unlock all Premium Grade A+ niches?")) {
        window.isPremium = true;
        // Re-render instantly to remove blur
        window.startSearch();
    }
}

window.saveGem = function(n) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(n)) {
        gems.push(n);
        localStorage.setItem('trGems', JSON.stringify(gems));
        updateSavedUI();
    }
}

function updateSavedUI() {
    const list = document.getElementById('alertsList');
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    list.innerHTML = gems.map(x => `
        <div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:10px; margin-bottom:8px; font-size:0.8rem; border:1px solid #333;">
            💎 ${x}
        </div>
    `).reverse().join('');
}

window.exportCSV = function() {
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    const csvContent = "data:text/csv;charset=utf-8,Niche Research\n" + gems.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tuberadar_export.csv");
    document.body.appendChild(link);
    link.click();
}
