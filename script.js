const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
const DOMAIN = "quickpromptget.blogspot.com";
window.isPremium = false;

window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value.trim();
    if(!q) return;

    const resContainer = document.getElementById('resultsContainer');
    resContainer.innerHTML = `
        <div class="loader-container">
            <div class="radar"></div>
            <p style="font-size:0.7rem; color:var(--primary); margin-top:15px; font-weight:bold;">SYNCING SATELLITES...</p>
        </div>`;

    try {
        const response = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await response.json();
        if(data && data[1]) {
            renderResults(data[1]);
        }
    } catch (e) {
        resContainer.innerHTML = "<p style='text-align:center;color:red;'>Sync Error.</p>";
    }
}

function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    list.forEach((item, i) => {
        const words = item.split(' ').length;
        const grade = words >= 4 ? "A+" : (words >= 3 ? "B" : "C");
        
        // Always blur A+ results for non-premium users
        const isLocked = (grade === "A+" && !window.isPremium);

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div style="flex:1;">
                <div style="font-size:0.6rem; font-weight:bold; color:var(--primary); margin-bottom:5px;">
                    ${grade === 'A+' ? '★ EXPLODING NICHE' : 'MARKET STABLE'}
                </div>
                <div class="${isLocked ? 'premium-blur' : ''}" style="font-weight:700; font-size:1rem; color:white;">
                    ${isLocked ? 'HIDDEN PREMIUM DATA' : item}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="score-circle grade-${grade.charAt(0)}">${grade}</div>
                ${isLocked ? 
                    `<button onclick="window.unlockPremium()" class="lock-btn"><i class="fas fa-lock"></i></button>` : 
                    `<button class="save-btn" onclick="window.saveGem('${item}')" style="background:rgba(255,255,255,0.05); border:1px solid #444; color:white; width:38px; height:38px; border-radius:10px; cursor:pointer;">+</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

window.unlockPremium = function() {
    if(confirm("Unlock all Premium Grade A+ niches?")) {
        window.isPremium = true;
        // Re-render instantly to remove blur
        window.startSearch();
    }
}

window.saveGem = function(n) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(n)) {
        gems.push(n);
        localStorage.setItem('trGems', JSON.stringify(gems));
        updateSavedUI();
    }
}

function updateSavedUI() {
    const list = document.getElementById('alertsList');
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    list.innerHTML = gems.map(x => `
        <div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:10px; margin-bottom:8px; font-size:0.8rem; border:1px solid #333;">
            💎 ${x}
        </div>
    `).reverse().join('');
}

window.exportCSV = function() {
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    const csvContent = "data:text/csv;charset=utf-8,Niche Research\n" + gems.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tuberadar_export.csv");
    document.body.appendChild(link);
    link.click();
}
