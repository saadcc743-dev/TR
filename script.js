const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
const ALLOWED_DOMAINS = ["saadcc743-dev.github.io", "quickpromptget.blogspot.com"]; 
let isPremium = false;
let isScanning = false;

// 1. Domain Lock
(function() {
    const host = window.location.hostname;
    if (!ALLOWED_DOMAINS.some(d => host.includes(d)) && !host.includes("localhost")) {
        document.body.innerHTML = "<div style='color:white;text-align:center;margin-top:50px;'>Unauthorized Access</div>";
        throw new Error("Unauthorized Domain");
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    updateSavedUI();
    // Live Pulse Simulation (Optimized for performance)
    setInterval(() => {
        const count = 120 + Math.floor(Math.random() * 40);
        const liveEl = document.getElementById('liveCount');
        if(liveEl) liveEl.innerText = `● ${count} Radars Active`;
    }, 8000);
});

// 2. Optimized Search with Satellite Caching
window.startSearch = async function() {
    if (isScanning) return; // Prevent spamming
    
    const qInput = document.getElementById('keywordInput');
    const q = qInput.value.trim().toLowerCase();
    if(!q) return;

    isScanning = true;
    const btn = document.getElementById('searchBtn');
    btn.disabled = true;
    btn.innerText = "...";

    const container = document.getElementById('resultsContainer');
    container.innerHTML = `<div class="radar-loader"><div class="radar-circle"></div><p style="color:var(--primary); font-size:0.7rem; margin-top:10px;">SYNCING SATELLITES...</p></div>`;
    
    // --- CACHE LOGIC ---
    const cacheKey = `tr_cache_${q}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (Date.now() - parsed.timestamp < 43200000) { // 12-hour local cache
            setTimeout(() => {
                renderResults(parsed.data);
                finishScan();
            }, 600);
            return;
        }
    }

    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data && data[1]) {
            // Save to local cache to prevent repeat API calls
            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: data[1]
            }));
            renderResults(data[1]);
        }
    } catch (e) { 
        container.innerHTML = "<p style='color:var(--danger);'>Satellite Overload. Try again shortly.</p>"; 
    } finally {
        finishScan();
    }
}

function finishScan() {
    isScanning = false;
    const btn = document.getElementById('searchBtn');
    btn.disabled = false;
    btn.innerText = "SCAN";
}

// 3. Render Results (High Performance)
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = ''; // Memory cleanup
    
    const fragment = document.createDocumentFragment(); // Faster rendering for many items

    list.forEach((text, i) => {
        const words = text.split(' ').length;
        const grade = words >= 4 ? "A+" : (words >= 3 ? "B" : "C");
        const isLocked = (grade === "A+" && !isPremium);
        
        const div = document.createElement('div');
        div.className = 'result-item';
        if(!isLocked) div.onclick = () => copyToClipboard(text);

        div.innerHTML = `
            <div style="flex:1;">
                <div class="${isLocked ? 'premium-blur' : ''}" style="font-weight:bold; color:white;">
                    ${isLocked ? 'PREMIUM DATA HIDDEN' : text}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;" onclick="event.stopPropagation()">
                <div class="score-circle grade-${grade[0]}">${grade}</div>
                ${isLocked ? 
                    `<button onclick="unlockPremium()" class="lock-btn"><i class="fas fa-lock"></i></button>` : 
                    `<button onclick="saveGem('${text}')" style="background:none; border:1px solid #444; color:white; border-radius:5px; cursor:pointer; width:35px; height:35px;">+</button>`
                }
            </div>
        `;
        fragment.appendChild(div);
    });
    container.appendChild(fragment);
}

// 4. Utility Functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('copyToast');
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2000);
    });
}

window.unlockPremium = function() {
    const conf = confirm("Unlock A+ results for this session?");
    if(conf) {
        isPremium = true; 
        const q = document.getElementById('keywordInput').value.trim();
        if(q) startSearch();
    }
}

window.saveGem = function(t) {
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
    list.innerHTML = gems.map(x => `
        <div class="saved-gem-item">
            <span style="font-size:0.8rem;">💎 ${x}</span>
            <i class="fas fa-trash" style="color:var(--danger); cursor:pointer;" onclick="removeGem('${x}')"></i>
        </div>
    `).reverse().join('');
}

window.removeGem = function(t) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]").filter(g => g !== t);
    localStorage.setItem('trGems', JSON.stringify(gems));
    updateSavedUI();
}
