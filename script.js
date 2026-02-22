const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
const ALLOWED_DOMAINS = ["saadcc743-dev.github.io", "quickpromptget.blogspot.com"]; 
window.isPremium = false;

// 1. SECURITY LOCK
(function() {
    const host = window.location.hostname;
    const isLocal = host === '127.0.0.1' || host === 'localhost';
    const isApproved = ALLOWED_DOMAINS.some(d => host.includes(d));
    if (!isLocal && !isApproved) {
        document.body.innerHTML = `<div style="padding:40px; text-align:center; color:#ff7675;"><h3>Access Denied</h3><p>Unauthorized Domain.</p></div>`;
        throw new Error("Unauthorized Domain");
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    updateSavedUI();
});

// 2. SEARCH ENGINE
window.startSearch = async function() {
    const queryInput = document.getElementById('keywordInput');
    const q = queryInput.value.trim().toLowerCase();
    if(!q) return;

    const container = document.getElementById('resultsContainer');
    container.innerHTML = `
        <div class="radar-loader">
            <div class="radar-circle"></div>
            <p style="color:var(--primary); font-size:0.75rem; font-weight:700; margin-top:15px;">SYNCING DATA...</p>
        </div>`;
    
    try {
        const response = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await response.json();
        
        if (data && data[1]) {
            renderResults(data[1].map(item => [item]));
        } else {
            container.innerHTML = "<p style='text-align:center; padding:20px;'>No results found.</p>";
        }
    } catch (e) { 
        container.innerHTML = "<p style='text-align:center; color:var(--danger); padding:20px;'>API Sync Failed. Please refresh.</p>"; 
    }
}

// 3. RESULT RENDERER
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = ''; // This clears the "Syncing" loader
    
    list.forEach((item, i) => {
        const text = item[0];
        const grade = text.split(' ').length >= 4 ? "A+" : (text.split(' ').length >= 3 ? "B" : "C");
        const isLocked = (grade === "A+" && !window.isPremium && i > 1);
        
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div style="flex:1;">
                <span style="font-size:0.65rem; font-weight:800; color:${grade === 'A+' ? 'var(--primary)' : 'var(--accent)'};">
                    ${grade === 'A+' ? '🔥 TRENDING' : 'STABLE'}
                </span>
                <div class="${isLocked ? 'premium-blur' : ''}" style="margin-top:5px; font-weight:600;">
                    ${isLocked ? 'PREMIUM DATA' : text}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="score-circle grade-${grade.charAt(0)}">${grade}</div>
                ${isLocked ? 
                    `<button onclick="window.unlockPremium()" class="lock-btn"><i class="fas fa-lock"></i></button>` : 
                    `<button class="save-btn" onclick="window.saveGem('${text}')">+</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

window.unlockPremium = function() {
    if(confirm("Unlock A+ results for this session?")) {
        window.isPremium = true;
        window.startSearch();
    }
}

window.saveGem = function(n) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(n)) { gems.push(n); localStorage.setItem('trGems', JSON.stringify(gems)); updateSavedUI(); }
}

window.removeGem = function(n) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]").filter(g => g !== n);
    localStorage.setItem('trGems', JSON.stringify(gems));
    updateSavedUI();
}

function updateSavedUI() {
    const list = document.getElementById('alertsList');
    if(!list) return;
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    list.innerHTML = gems.map(x => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:8px; border-radius:6px; margin-bottom:5px;">
            <span style="font-size:0.75rem;">💎 ${x}</span>
            <i class="fas fa-trash" onclick="window.removeGem('${x}')" style="color:#ff7675; cursor:pointer;"></i>
        </div>
    `).reverse().join('');
}
