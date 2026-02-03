const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
const ALLOWED_DOMAINS = ["saadcc743-dev.github.io", "yourblog.blogspot.com"]; 
let isPremium = false;

// 1. Domain Lock & Kill Switch
(function() {
    const host = window.location.hostname;
    if (!ALLOWED_DOMAINS.some(d => host.includes(d))) {
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('lockScreen').style.display = 'block';
        throw new Error("Unauthorized Domain");
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    loadHourlyHarvest();
    updateSavedUI();
    setInterval(() => {
        const count = 120 + Math.floor(Math.random() * 40);
        document.getElementById('liveCount').innerText = `● ${count} Radars Active`;
    }, 8000);
});

// 2. Fetch Initial Trends
async function loadHourlyHarvest() {
    const tag = document.getElementById('updateTag');
    try {
        const res = await fetch(`${WORKER_URL}?get_harvest=true&t=${Date.now()}`);
        const data = await res.json();
        if (data && data.niches) {
            tag.innerText = "LIVE";
            tag.style.background = "#00b894";
            renderResults(data.niches.map(n => [n]));
        }
    } catch (e) { tag.innerText = "OFFLINE"; }
}

// 3. Search Logic
window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value.trim();
    if(!q) return;
    const container = document.getElementById('resultsContainer');
    container.innerHTML = `<div class="radar-loader"><div class="radar-circle"></div><div style="margin-top:15px; font-size:0.8rem; color:#00b894;">SCANNING SATELLITES...</div></div>`;
    
    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data && data[1]) {
            setTimeout(() => renderResults(data[1].map(item => [item])), 800);
        }
    } catch (e) { container.innerHTML = "<p>Connection Lost.</p>"; }
}

// 4. Render Results
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    list.forEach((item, i) => {
        const text = item[0];
        const grade = text.split(' ').length >= 4 ? "A+" : (text.split(' ').length >= 3 ? "B" : "C");
        const isLocked = (grade === "A+" && !isPremium && i > 2);
        const trend = grade === "A+" ? '<span class="trend-meta trend-up"><i class="fas fa-arrow-trend-up"></i> HOT</span>' : '<span class="trend-meta trend-new">NEW</span>';

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div style="flex:1;">
                ${trend}
                <span style="${isLocked ? 'filter:blur(4px);' : ''}">${isLocked ? '••••••••••••' : text}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="score-circle grade-${grade[0]}">${grade}</div>
                ${!isLocked ? `<button onclick="saveGem('${text}')" style="background:none; border:1px solid #444; color:#aaa; cursor:pointer; border-radius:4px;">+</button>` : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

// 5. Gem Management
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
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    list.innerHTML = gems.map(x => `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #333;">
            <span style="font-size:0.85rem;">💎 ${x}</span>
            <i class="fas fa-trash-can" onclick="removeGem('${x}')" style="color:#ff7675; cursor:pointer; font-size:0.8rem;"></i>
        </div>
    `).join('');
}

window.exportCSV = function() {
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.length) return alert("No gems saved!");
    const blob = new Blob(["Niche\n" + gems.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'tuberadar-research.csv'; a.click();
}

window.subscribeAlert = function() { window.open("https://forms.google.com/your-form-link", "_blank"); }
window.showRewardedAd = function() { alert("Premium Unlocked!"); isPremium = true; document.getElementById('unlockBtn').style.display='none'; loadHourlyHarvest(); }
