const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
const ALLOWED_DOMAINS = ["saadcc743-dev.github.io", "quickpromptget.blogspot.com"]; 
let isPremium = false;

// Domain Lock Security
(function() {
    const host = window.location.hostname;
    if (!ALLOWED_DOMAINS.some(d => host.includes(d)) && !host.includes("localhost")) {
        document.body.innerHTML = "<div style='color:white;text-align:center;margin-top:50px;'>Unauthorized Domain</div>";
        throw new Error("Unauthorized Domain");
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    updateSavedUI();
    setInterval(() => {
        const count = 120 + Math.floor(Math.random() * 40);
        const liveEl = document.getElementById('liveCount');
        if(liveEl) liveEl.innerText = `● ${count} Radars Active`;
    }, 8000);
});

window.startSearch = async function() {
    const qInput = document.getElementById('keywordInput');
    const q = qInput.value.trim().toLowerCase();
    if(!q) return;

    const container = document.getElementById('resultsContainer');
    container.innerHTML = `<div class="radar-loader"><div class="radar-circle"></div><p style="color:var(--primary); font-size:0.7rem; margin-top:10px;">SCANNING SATELLITES...</p></div>`;
    
    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data && data[1]) {
            renderResults(data[1]);
        }
    } catch (e) { 
        container.innerHTML = "<p style='color:var(--danger);'>Satellite Connection Failed.</p>"; 
    }
}

function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    list.forEach((text, i) => {
        const words = text.split(' ').length;
        const grade = words >= 4 ? "A+" : (words >= 3 ? "B" : "C");
        // Lock logic: Grade A+ results are blurred unless premium is active
        const isLocked = (grade === "A+" && !isPremium);
        
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div style="flex:1;">
                <div class="${isLocked ? 'premium-blur' : ''}" style="font-weight:bold; color:white;">
                    ${isLocked ? 'PREMIUM NICHE HIDDEN' : text}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="score-circle grade-${grade[0]}">${grade}</div>
                ${isLocked ? 
                    `<button onclick="unlockPremium()" class="lock-btn"><i class="fas fa-lock"></i></button>` : 
                    `<button onclick="saveGem('${text}')" style="background:none; border:1px solid #444; color:white; border-radius:5px; cursor:pointer; width:35px; height:35px;">+</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

window.unlockPremium = function() {
    if(confirm("Watch a short ad to unlock all Premium A+ results?")) {
        // Here you would normally trigger your Rewarded AdSense Ad
        isPremium = true; 
        startSearch(); // Re-scans to show unblurred results
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

window.exportCSV = function() {
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.length) return alert("No gems to export!");
    const csvContent = "data:text/csv;charset=utf-8," + gems.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tuberadar_export.csv");
    document.body.appendChild(link);
    link.click();
}
