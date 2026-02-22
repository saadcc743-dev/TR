const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
window.isPremium = false;

// 1. Start Search
window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value.trim();
    if(!q) return;

    const container = document.getElementById('resultsContainer');
    container.innerHTML = `
        <div class="radar-loader">
            <div class="radar-circle"></div>
            <p style="color:var(--primary); font-size:0.7rem; margin-top:10px; font-weight:800;">SYNCING SATELLITES...</p>
        </div>`;

    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if(data && data[1]) {
            renderResults(data[1]);
        }
    } catch (e) {
        container.innerHTML = "<p style='color:var(--danger); text-align:center;'>Satellite Offline. Try again.</p>";
    }
};

// 2. Render Search Results
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';

    list.forEach((item, i) => {
        const words = item.split(' ').length;
        const grade = words >= 4 ? "A+" : (words >= 3 ? "B" : "C");
        const isLocked = (grade === "A+" && !window.isPremium);

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div style="flex:1;">
                <div style="font-size:0.6rem; color:var(--primary); font-weight:bold; margin-bottom:3px;">GRADED DATA</div>
                <div class="${isLocked ? 'premium-blur' : ''}" style="font-weight:700;">
                    ${isLocked ? 'HIDDEN PREMIUM DATA' : item}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="score-circle grade-${grade.charAt(0)}">${grade}</div>
                ${isLocked ? 
                    `<button class="lock-btn" onclick="window.unlockPremium()"><i class="fas fa-lock"></i></button>` : 
                    `<button style="background:none; border:1px solid #444; color:white; width:36px; height:36px; border-radius:50%; cursor:pointer;" onclick="window.saveGem('${item}')">+</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

// 3. Unlock Logic
window.unlockPremium = function() {
    if(confirm("Watch a quick ad to unlock Grade A+ niches?")) {
        window.isPremium = true;
        window.startSearch(); // Re-render to clear blur
    }
};

// 4. Saved Gems Logic
window.saveGem = function(n) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(n)) {
        gems.push(n);
        localStorage.setItem('trGems', JSON.stringify(gems));
        updateSavedUI();
    }
};

window.removeGem = function(n) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]").filter(g => g !== n);
    localStorage.setItem('trGems', JSON.stringify(gems));
    updateSavedUI();
};

function updateSavedUI() {
    const list = document.getElementById('alertsList');
    if(!list) return;
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    
    list.innerHTML = gems.map(x => `
        <div class="saved-gem-item">
            <span style="font-size:0.8rem;">💎 ${x}</span>
            <i class="fas fa-trash-alt" onclick="window.removeGem('${x}')"></i>
        </div>
    `).reverse().join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateSavedUI();
    setInterval(() => {
        const count = 200 + Math.floor(Math.random() * 50);
        document.getElementById('liveCount').innerText = `● ${count} RADARS ACTIVE`;
    }, 4000);
});
