const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
let isPremium = false;
let selectedNiches = new Set();
let lastSearchResults = [];

// 1. DOMAIN LOCK
const authorized = ["quickpromptget.blogspot.com", "github.io", "localhost"];
if (!authorized.some(d => window.location.hostname.includes(d))) {
    document.body.innerHTML = "<div style='color:white;text-align:center;padding:50px;'><h1>Access Denied</h1></div>";
}

// 2. INIT
document.addEventListener('DOMContentLoaded', () => {
    const startup = ["AI Finance Channel", "Sustainable Tech 2026", "Passive Income SaaS"];
    lastSearchResults = startup;
    renderResults(startup);
    loadSavedGems();
    
    setInterval(() => {
        const el = document.getElementById('liveCount');
        if(el) el.innerText = `● ${135 + Math.floor(Math.random() * 20)} RADARS ACTIVE`;
    }, 4000);
});

// 3. SEARCH & RENDER
window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value.trim();
    if(!q) return;

    isPremium = false;
    const container = document.getElementById('resultsContainer');
    container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--primary);">Scanning Satellites...</div>`;

    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data && data[1]) {
            lastSearchResults = data[1];
            selectedNiches.clear();
            updateCopyBtn();
            renderResults(data[1]);
        }
    } catch (e) {
        lastSearchResults = [`${q} automation`, `${q} ideas 2026`, `profitable ${q}`];
        renderResults(lastSearchResults);
    }
}

function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    list.forEach((text, i) => {
        const isLocked = (text.split(' ').length >= 3 && !isPremium && i > 0);
        const div = document.createElement('div');
        // Critical Fix: Ensure the class 'selected' is applied correctly
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
            updateCopyBtn(); // Refresh the sticky button state
        };

        div.innerHTML = `
            <div style="flex:1">
                <div class="${isLocked ? 'premium-blur' : ''}" style="font-weight:bold;">
                    ${isLocked ? 'HIDDEN PREMIUM NICHE' : text}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;" onclick="event.stopPropagation()">
                <div class="score-circle grade-${isLocked ? 'C' : 'A'}">${isLocked ? '?' : 'A+'}</div>
                ${isLocked ? 
                    `<button onclick="unlockViaAd()" class="lock-btn"><i class="fas fa-lock"></i></button>` : 
                    `<button onclick="saveGem('${text.replace(/'/g, "\\'")}')" style="background:none; border:1px solid #444; color:white; border-radius:5px; width:30px; height:30px; cursor:pointer;">+</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

// 4. UNLOCK & BIN LOGIC
window.unlockViaAd = function() {
    if(confirm("Watch ad to unlock Premium Data?")) {
        setTimeout(() => {
            isPremium = true;
            renderResults(lastSearchResults);
        }, 1000);
    }
}

window.toggleBin = () => document.getElementById('researchSidebar').classList.toggle('active');

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

// --- 5. FIXED COPY LOGIC ---
window.updateCopyBtn = function() {
    const btn = document.getElementById('copySelectedBtn');
    if (selectedNiches.size > 0) {
        btn.style.display = 'block';
        btn.innerHTML = `<i class="fas fa-copy"></i> COPY ${selectedNiches.size} NICHES`;
    } else {
        btn.style.display = 'none';
    }
}

// Double-Action Clipboard Function
async function copyToClipboard(text) {
    if (!text) return;
    
    // Attempt 1: Modern API
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Attempt 2: Fallback ExecCommand
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (e) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

window.copySelectedToClipboard = async function() {
    const text = Array.from(selectedNiches).join('\n');
    const success = await copyToClipboard(text);
    
    if (success) {
        showToast("Copied to Clipboard!");
        selectedNiches.clear();
        updateCopyBtn();
        document.querySelectorAll('.result-item').forEach(el => el.classList.remove('selected'));
    } else {
        alert("Copy failed. Please try again or use a different browser.");
    }
}

window.copyBinToClipboard = async function() {
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    const success = await copyToClipboard(gems.join('\n'));
    if (success) showToast("Bin Copied!");
}

function loadSavedGems() {
    const list = document.getElementById('alertsList');
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    const badge = document.getElementById('binCountBadge');
    if(badge) badge.innerText = gems.length;
    
    let html = `<div style="display:flex; justify-content:space-between; margin-bottom:10px;">
        <b style="font-size:0.8rem; color:#888;">RESEARCH BIN</b>
        ${gems.length > 0 ? `<button onclick="copyBinToClipboard()" style="background:var(--primary); color:white; border:none; padding:3px 8px; border-radius:5px; font-size:0.7rem; cursor:pointer;">COPY ALL</button>` : ''}
    </div>`;

    html += gems.map((x, i) => `
        <div class="saved-item">
            <span>💎 ${x}</span>
            <span class="bin-remove-btn" onclick="removeGem(${i})">&times;</span>
        </div>
    `).reverse().join('');
    
    list.innerHTML = html || "<div style='text-align:center; font-size:0.8rem; color:#555;'>Bin is empty.</div>";
}

function showToast(msg) {
    const t = document.getElementById('copyToast');
    t.innerText = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 2000);
}
