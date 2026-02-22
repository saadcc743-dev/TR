/**
 * TubeRadar Pro - Niche Scanner Logic
 * Version: 2026.Final
 * Features: Domain Lock, Smart Cache, Premium Blur, Hybrid Fetching
 */

const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
const ALLOWED_DOMAINS = ["saadcc743-dev.github.io", "quickpromptget.blogspot.com"]; 
let isPremium = false;

// 1. SECURITY: Domain Lock & Kill Switch
(function() {
    const host = window.location.hostname;
    const isLocal = host === '127.0.0.1' || host === 'localhost';
    if (!isLocal && !ALLOWED_DOMAINS.some(d => host.includes(d))) {
        const app = document.getElementById('mainApp');
        if(app) app.innerHTML = `<div style="padding:40px; text-align:center; color:#ff7675;"><h3>Security Alert</h3><p>Unauthorized Domain. Please visit the official site.</p></div>`;
        throw new Error("Unauthorized Access");
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    loadHourlyHarvest();
    updateSavedUI();
    // Start Live Activity Pulse
    startLiveActivityPulse();
});

// 2. LIVE PULSE: Simulates real-time users
function startLiveActivityPulse() {
    setInterval(() => {
        const count = 140 + Math.floor(Math.random() * 55);
        const liveEl = document.getElementById('liveCount');
        if(liveEl) liveEl.innerText = `● ${count} Radars Active`;
    }, 10000);
}

// 3. INITIAL TRENDS: Loads "Featured" niches
async function loadHourlyHarvest() {
    const tag = document.getElementById('updateTag');
    try {
        const res = await fetch(`${WORKER_URL}?get_harvest=true&t=${Date.now()}`);
        const data = await res.json();
        if (data && data.niches) {
            if(tag) { tag.innerText = "LIVE"; tag.style.background = "#00b894"; }
            renderResults(data.niches.map(n => [n]));
        }
    } catch (e) { 
        if(tag) tag.innerText = "OFFLINE"; 
        console.error("Initial load failed", e);
    }
}

// 4. THE SCAN ENGINE: With Smart 12-Hour Caching
window.startSearch = async function() {
    const input = document.getElementById('keywordInput');
    const q = input.value.trim().toLowerCase();
    if(!q) return;

    const container = document.getElementById('resultsContainer');
    // Show Radar Loader
    container.innerHTML = `
        <div class="radar-loader">
            <div class="radar-circle"></div>
            <div style="margin-top:20px; font-size:0.85rem; color:var(--primary); font-weight:700; letter-spacing:1px;">
                SATELLITE SYNCING...
            </div>
        </div>`;
    
    // Check Cache (Prevents unnecessary API calls)
    const cacheKey = `tr_cache_${q}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 43200000) { // 12 Hours
            setTimeout(() => renderResults(parsed.data.map(item => [item])), 600);
            return;
        }
    }

    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        
        if (data && data[1]) {
            // Store in Cache
            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: data[1]
            }));
            
            setTimeout(() => renderResults(data[1].map(item => [item])), 1000);
        } else {
            container.innerHTML = "<p style='text-align:center; padding:20px;'>No data found for this niche.</p>";
        }
    } catch (e) { 
        container.innerHTML = "<p style='text-align:center; color:var(--danger); padding:20px;'>Connection lost. Re-scanning...</p>"; 
    }
}

// 5. THE RENDERER: Handles Grade Logic and Dynamic Blur
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    if(!container) return;
    container.innerHTML = '';
    
    list.forEach((item, i) => {
        const text = item[0];
        const words = text.split(' ').length;
        
        // 2026 Grading Algorithm
        let grade = "C";
        if (words >= 4) grade = "A+";
        else if (words >= 3) grade = "B";

        // BLUR TRIGGER: Activates every time if not premium
        const isLocked = (grade === "A+" && !isPremium && i > 1);
        
        const trendTag = grade === "A+" ? 
            `<span class="trend-meta trend-up"><i class="fas fa-bolt"></i> EXPLODING</span>` : 
            `<span class="trend-meta trend-new">STABLE</span>`;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'result-item';
        itemDiv.innerHTML = `
            <div style="flex:1;">
                ${trendTag}
                <div style="font-weight:600; font-size:0.95rem; ${isLocked ? 'filter:blur(6px); opacity:0.5; user-select:none;' : ''}">
                    ${isLocked ? 'HIDDEN PREMIUM NICHE' : text}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="score-circle grade-${grade.charAt(0)}">${grade}</div>
                ${isLocked ? 
                    `<button onclick="showRewardedAd()" class="lock-btn"><i class="fas fa-lock"></i></button>` : 
                    `<button class="save-btn" onclick="saveGem('${text}')">+</button>`
                }
            </div>
        `;
        container.appendChild(itemDiv);
    });
}

// 6. STORAGE: Save/Remove Niche Gems
window.saveGem = function(niche) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(niche)) { 
        gems.push(niche); 
        localStorage.setItem('trGems', JSON.stringify(gems)); 
        updateSavedUI(); 
    }
}

window.removeGem = function(niche) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]").filter(g => g !== niche);
    localStorage.setItem('trGems', JSON.stringify(gems));
    updateSavedUI();
}

function updateSavedUI() {
    const list = document.getElementById('alertsList');
    if(!list) return;
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    
    if (gems.length === 0) {
        list.innerHTML = `<p style="font-size:0.75rem; color:#666; text-align:center; padding:10px;">Your research bin is empty.</p>`;
        return;
    }

    list.innerHTML = gems.map(x => `
        <div class="saved-gem-item">
            <span style="font-size:0.8rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">💎 ${x}</span>
            <i class="fas fa-trash-can" onclick="removeGem('${x}')" title="Remove"></i>
        </div>
    `).reverse().join('');
}

// 7. EXPORT: Download CSV for creators
window.exportCSV = function() {
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(gems.length === 0) return alert("Save some niche ideas first!");
    
    const csvContent = "data:text/csv;charset=utf-8,TubeRadar Research Export\nNiche Name\n" + gems.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tuberadar_export_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 8. MONETIZATION: AdSense Reward Hook
window.showRewardedAd = function() {
    // This function acts as the bridge for AdSense for Search / Rewarded Video
    const confirmUnlock = confirm("Unlock all A+ Premium results by watching a short sponsorship?");
    if(confirmUnlock) {
        // Here you would normally trigger the AdSense Rewarded API
        // For now, we simulate success:
        isPremium = true;
        alert("Success! Premium Niches Unlocked for this session.");
        
        // Re-render the current search to show unblurred results
        startSearch(); 
    }
}
