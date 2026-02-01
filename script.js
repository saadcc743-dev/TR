const WORKER_URL = "https://tuberadar-api.yourname.workers.dev"; 
let isPremium = false;

document.addEventListener('DOMContentLoaded', () => {
    loadHourlyHarvest();
    updateSavedUI();
    // Simulate live user traffic
    setInterval(() => {
        const c = 120 + Math.floor(Math.random() * 45);
        document.getElementById('liveCount').innerText = `● ${c} Scanning Now`;
    }, 9000);
});

async function loadHourlyHarvest() {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '<p>Harvesting live trends...</p>';
    try {
        const res = await fetch(`${WORKER_URL}?get_harvest=true`);
        const data = await res.json();
        document.getElementById('updateTag').innerText = `LIVE: ${new Date(data.lastUpdated).toLocaleTimeString()}`;
        renderResults(data.niches.map(n => [n]));
    } catch (e) { container.innerHTML = "Radar offline. Refresh."; }
}

window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value;
    if(!q) return;
    const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    renderResults(data[1]);
}

function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    let foundEpic = false;

    list.forEach((item, i) => {
        const text = item[0];
        const words = text.split(' ').length;
        let grade = words >= 4 ? "A+" : (words >= 3 ? "B" : "C");
        const isLocked = (grade === "A+" && !isPremium && i > 3);

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div class="${isLocked ? 'premium-locked' : ''}">
                <strong style="cursor:pointer" onclick="document.getElementById('keywordInput').value='${text}';startSearch()">${isLocked ? '••••••••••••' : text}</strong>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
                <div class="score-circle grade-${grade[0]}">${grade}</div>
                ${!isLocked ? `<button onclick="saveGem('${text}')" style="border:none;background:none;color:#6c5ce7;cursor:pointer;"><i class="fas fa-plus-circle"></i></button>` : ''}
            </div>
        `;
        container.appendChild(div);
        if(grade === "A+" && !isLocked) foundEpic = true;
    });
    if(foundEpic) confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
}

window.showRewardedAd = function() {
    alert("Watching Ad... (Unlock Successful)");
    setTimeout(() => {
        isPremium = true;
        document.getElementById('unlockBtn').style.display = 'none';
        loadHourlyHarvest();
    }, 2000);
}

function saveGem(t) {
    let g = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!g.includes(t)) g.push(t);
    localStorage.setItem('trGems', JSON.stringify(g));
    updateSavedUI();
}

function updateSavedUI() {
    const l = document.getElementById('alertsList');
    const g = JSON.parse(localStorage.getItem('trGems') || "[]");
    l.innerHTML = g.map(x => `<div style="font-size:11px;padding:6px;border-bottom:1px solid #eee;"><i class="fas fa-check"></i> ${x}</div>`).join('');
}

document.getElementById('exportCsv').onclick = () => {
    const g = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(g.length === 0) return alert("Save some niches first!");
    const blob = new Blob([["Niche Keyword"], ...g.map(x => [x])].join('\n'), { type: 'text/csv' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = u; a.download = 'radar-gems.csv'; a.click();
}
document.getElementById('searchBtn').onclick = () => startSearch();

