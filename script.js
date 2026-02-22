const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
window.isPremium = false;

window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value.trim();
    if(!q) return;

    const container = document.getElementById('resultsContainer');
    container.innerHTML = `<div class="radar-loader"><div class="radar-circle"></div><p style="color:var(--primary); font-size:0.7rem; margin-top:15px; font-weight:bold;">SATELLITE SYNCING...</p></div>`;

    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if(data && data[1]) { renderResults(data[1]); }
    } catch (e) {
        container.innerHTML = "<p style='color:red; text-align:center;'>Connection Error.</p>";
    }
};

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
                <div style="font-size:0.6rem; color:var(--primary); font-weight:bold;">ANALYSIS COMPLETE</div>
                <div class="${isLocked ? 'premium-blur' : ''}" style="font-weight:700; color:white; font-size:1rem;">
                    ${isLocked ? 'PREMIUM DATA HIDDEN' : item}
                </div>
            </div>
            <div class="item-right">
                <div class="score-circle grade-${grade.charAt(0)}">${grade}</div>
                ${isLocked ? 
                    `<button class="lock-btn" onclick="window.unlockPremium()"><i class="fas fa-lock"></i></button>` : 
                    `<button style="background:none; border:1px solid #444; color:white; width:40px; height:40px; border-radius:12px; cursor:pointer;" onclick="window.saveGem('${item}')">+</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

window.unlockPremium = function() {
    if(confirm("Unlock Premium Grade A+ Niches?")) {
        window.isPremium = true;
        window.startSearch();
    }
};

window.saveGem = function(n) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(n)) {
        gems.push(n);
        localStorage.setItem('trGems', JSON.stringify(gems));
        updateSavedUI();
    }
};

function updateSavedUI() {
    const list = document.getElementById('alertsList');
    if(!list) return;
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    list.innerHTML = gems.map(x => `
        <div class="saved-gem-item">
            <span style="font-size:0.8rem;">💎 ${x}</span>
            <i class="fas fa-trash-alt" style="color:red; cursor:pointer;" onclick="removeGem('${x}')"></i>
        </div>
    `).reverse().join('');
}

function removeGem(n) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]").filter(g => g !== n);
    localStorage.setItem('trGems', JSON.stringify(gems));
    updateSavedUI();
}

document.addEventListener('DOMContentLoaded', updateSavedUI);
const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
window.isPremium = false;

window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value.trim();
    if(!q) return;

    const container = document.getElementById('resultsContainer');
    container.innerHTML = `
        <div class="radar-loader">
            <div class="radar-circle"></div>
            <p style="color:var(--primary); font-size:0.7rem; margin-top:15px; font-weight:bold;">SATELLITE SYNCING...</p>
        </div>`;

    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if(data && data[1]) { renderResults(data[1]); }
    } catch (e) {
        container.innerHTML = "<p style='color:var(--danger); text-align:center;'>Connection Error.</p>";
    }
};

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
                <div style="font-size:0.6rem; color:var(--primary); font-weight:bold;">ANALYSIS COMPLETE</div>
                <div class="${isLocked ? 'premium-blur' : ''}" style="font-weight:700; color:white; font-size:1rem;">
                    ${isLocked ? 'PREMIUM DATA HIDDEN' : item}
                </div>
            </div>
            <div class="item-right">
                <div class="score-circle grade-${grade.charAt(0)}">${grade}</div>
                ${isLocked ? 
                    `<button class="lock-btn" onclick="window.unlockPremium()"><i class="fas fa-lock"></i></button>` : 
                    `<button style="background:none; border:1px solid #444; color:white; width:40px; height:40px; border-radius:12px; cursor:pointer;" onclick="window.saveGem('${item}')">+</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

window.unlockPremium = function() {
    if(confirm("Unlock Premium Grade A+ Niches?")) {
        window.isPremium = true;
        window.startSearch();
    }
};

window.saveGem = function(n) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(n)) {
        gems.push(n);
        localStorage.setItem('trGems', JSON.stringify(gems));
        updateSavedUI();
    }
};

function updateSavedUI() {
    const list = document.getElementById('alertsList');
    if(!list) return;
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    list.innerHTML = gems.map(x => `
        <div class="saved-gem-item">
            <span style="font-size:0.8rem;">💎 ${x}</span>
            <i class="fas fa-trash-alt" style="color:var(--danger); cursor:pointer;" onclick="removeGem('${x}')"></i>
        </div>
    `).reverse().join('');
}

function removeGem(n) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]").filter(g => g !== n);
    localStorage.setItem('trGems', JSON.stringify(gems));
    updateSavedUI();
}

document.addEventListener('DOMContentLoaded', updateSavedUI);
