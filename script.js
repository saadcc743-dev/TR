const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
window.isPremium = false;

document.addEventListener('DOMContentLoaded', () => {
    updateSavedUI();
    setInterval(() => {
        const count = 150 + Math.floor(Math.random() * 30);
        const el = document.getElementById('liveCount');
        if(el) el.innerText = `● ${count} Radars Active`;
    }, 5000);
});

// 1. SEARCH LOGIC
window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value.trim().toLowerCase();
    if(!q) return;

    const container = document.getElementById('resultsContainer');
    container.innerHTML = `<div class="radar-loader"><div class="radar-circle"></div><p style="color:var(--primary); font-size:0.7rem; margin-top:10px;">SCANNING SATELLITES...</p></div>`;
    
    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data && data[1]) {
            setTimeout(() => renderResults(data[1].map(item => [item])), 800);
        }
    } catch (e) { container.innerHTML = "<p>Connection Error.</p>"; }
}

// 2. RENDERER WITH DYNAMIC BLUR
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    list.forEach((item, i) => {
        const text = item[0];
        const words = text.split(' ').length;
        const grade = words >= 4 ? "A+" : (words >= 3 ? "B" : "C");
        
        // Apply blur to A+ results if not premium
        const isLocked = (grade === "A+" && !window.isPremium && i > 1);

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div style="flex:1;">
                <span style="font-size:0.7rem; color:${grade === 'A+' ? 'var(--primary)' : 'var(--accent)'}; font-weight:bold;">
                    ${grade === 'A+' ? '🔥 HIGH GROWTH' : 'STABLE'}
                </span>
                <div class="${isLocked ? 'premium-blur' : ''}" style="margin-top:5px;">
                    ${isLocked ? 'PREMIUM NICHE DATA' : text}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="score-circle grade-${grade.charAt(0)}">${grade}</div>
                ${isLocked ? 
                    `<button onclick="window.unlockPremium()" class="lock-btn"><i class="fas fa-lock"></i></button>` : 
                    `<button class="save-btn" onclick="saveGem('${text}')">+</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

// 3. PREMIUM UNLOCK ENGINE
window.unlockPremium = function() {
    if(confirm("Watch a quick sponsored ad to unlock A+ results?")) {
        window.isPremium = true;
        alert("Premium Unlocked!");
        window.startSearch(); // Re-scans to show clean data
    }
}

// 4. SAVE & EXPORT
window.saveGem = function(t) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(t)) { gems.push(t); localStorage.setItem('trGems', JSON.stringify(gems)); updateSavedUI(); }
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
    list.innerHTML = gems.map(x => `
        <div style="display:flex; justify-content:space-between; padding:8px; background:#161d21; margin-bottom:5px; border-radius:5px;">
            <span style="font-size:0.8rem;">💎 ${x}</span>
            <i class="fas fa-trash" onclick="removeGem('${x}')" style="color:var(--danger); cursor:pointer;"></i>
        </div>
    `).reverse().join('');
}
