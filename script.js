const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
let isPremium = false;
let selectedNiches = new Set();
let lastSearchResults = []; // Cache to allow instant unblur without re-fetching

// --- 1. DOMAIN LOCK ---
const authorizedDomains = ["quickpromptget.blogspot.com", "github.io", "localhost"];
const isAuthorized = authorizedDomains.some(domain => window.location.hostname.includes(domain));

if (!isAuthorized) {
    document.body.innerHTML = `
        <div style="background:#0f1418; color:white; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding:20px;">
            <h1 style="color:#ff7675;">403 - Unauthorized Domain</h1>
            <p>This tool is protected. Please visit the official site:</p>
            <a href="https://quickpromptget.blogspot.com" style="color:#00b894; font-weight:bold; text-decoration:none; border:1px solid #00b894; padding:10px 20px; border-radius:8px;">Go to TubeRadar Pro</a>
        </div>`;
}

// --- 2. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const startupNiches = ["AI Faceless Channels 2026", "Budget Solo Travel Guides", "Passive Income Micro-SaaS", "Aesthetic Desk Setups"];
    lastSearchResults = startupNiches;
    renderResults(startupNiches);
    
    // Live Pulse Simulation
    setInterval(() => {
        const liveEl = document.getElementById('liveCount');
        if(liveEl) liveEl.innerText = `● ${120 + Math.floor(Math.random() * 40)} RADARS ACTIVE`;
    }, 4000);

    loadSavedGems();
});

// --- 3. SEARCH LOGIC ---
window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value.trim();
    if(!q) return;

    isPremium = false; // RESET lock for every new search term
    const container = document.getElementById('resultsContainer');
    container.innerHTML = `<div style="text-align:center; padding:20px; color:#00b894;">Scanning satellites...</div>`;

    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data && data[1]) {
            lastSearchResults = data[1]; // Cache results
            selectedNiches.clear();
            updateCopyBtn();
            renderResults(data[1]);
        }
    } catch (e) {
        const fallback = [`${q} automation`, `${q} for beginners 2026`, `profitable ${q} ideas` ];
        lastSearchResults = fallback;
        selectedNiches.clear();
        updateCopyBtn();
        renderResults(fallback);
    }
}

// --- 4. RENDERING ENGINE ---
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    list.forEach((text, i) => {
        const words = text.split(' ').length;
        const grade = words >= 4 ? "A+" : "B";
        const isLocked = (grade === "A+" && !isPremium && i > 0); 
        
        const div = document.createElement('div');
        div.className = `result-item ${selectedNiches.has(text) ? 'selected' : ''}`;
        
        div.onclick = () => {
            if(isLocked) return;
            if(selectedNiches.has(text)) {
                selectedNiches.delete(text);
                div.classList.remove('selected');
            } else {
                selectedNiches.add(text);
                div.classList.add('selected');
            }
            updateCopyBtn();
        };

        div.innerHTML = `
            <div style="flex:1; padding-right:10px;">
                <div class="${isLocked ? 'premium-blur' : ''}" style="font-weight:bold;">
                    ${isLocked ? 'PREMIUM DATA LOCKED' : text}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;" onclick="event.stopPropagation()">
                <div class="score-circle grade-${grade.charAt(0)}">${grade}</div>
                ${isLocked ? 
                    `<button onclick="unlockViaAd()" class="lock-btn"><i class="fas fa-lock"></i></button>` : 
                    `<button onclick="saveGem('${text.replace(/'/g, "\\'")}')" style="background:none; border:1px solid #444; color:white; border-radius:5px; width:35px; height:35px; cursor:pointer;">+</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

// --- 5. UNLOCK SYSTEM ---
window.unlockViaAd = function() {
    if(confirm("Watch a short Ad to unlock all Grade A+ Premium Niches?")) {
        // Logic: Set premium true and re-render the CACHED results instantly
        setTimeout(() => {
            isPremium = true;
            renderResults(lastSearchResults); // Instant unblur without fetching
        }, 1000);
    }
}

// --- 6. RESEARCH BIN & FAB ---
window.toggleBin = function() {
    const bin = document.getElementById('researchSidebar');
    bin.classList.toggle('active');
}

window.saveGem = function(text) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(text)) {
        gems.push(text);
        localStorage.setItem('trGems', JSON.stringify(gems));
        loadSavedGems();
    }
}

window.removeGem = function(index) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    gems.splice(index, 1);
    localStorage.setItem('trGems', JSON.stringify(gems));
    loadSavedGems();
}

window.copyBinToClipboard = function() {
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    const textToCopy = gems.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
        const btn = document.getElementById('copyBinBtn');
        btn.innerText = "COPIED! ✅";
        setTimeout(() => btn.innerText = "COPY ALL", 2000);
    });
}

function loadSavedGems() {
    const list = document.getElementById('alertsList');
    const badge = document.getElementById('binCountBadge');
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    
    if(badge) badge.innerText = gems.length;

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <span style="font-size:0.8rem; font-weight:bold; color:#888;">RESEARCH BIN</span>
            ${gems.length > 0 ? `<button id="copyBinBtn" onclick="copyBinToClipboard()">COPY ALL</button>` : ''}
        </div>
    `;

    if(gems.length === 0) {
        html += `<div style="text-align:center; padding:20px; color:#555; font-size:0.8rem;">Your bin is empty.</div>`;
    } else {
        html += gems.map((x, i) => `
            <div class="saved-item">
                <span>💎 ${x}</span>
                <span class="bin-remove-btn" onclick="removeGem(${i})">&times;</span>
            </div>
        `).reverse().join('');
    }
    list.innerHTML = html;
}

// --- 7. UTILS ---
function updateCopyBtn() {
    const btn = document.getElementById('copySelectedBtn');
    btn.style.display = selectedNiches.size > 0 ? 'block' : 'none';
    btn.innerText = `COPY ${selectedNiches.size} SELECTED NICHES`;
}

window.copySelectedToClipboard = function() {
    const textToCopy = Array.from(selectedNiches).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
        const toast = document.getElementById('copyToast');
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2000);
        selectedNiches.clear();
        updateCopyBtn();
        document.querySelectorAll('.result-item').forEach(el => el.classList.remove('selected'));
    });
}
