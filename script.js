const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
const DOMAIN = "quickpromptget.blogspot.com";
window.isPremium = false;

// Domain Security
(function() {
    if (!window.location.hostname.includes(DOMAIN) && !window.location.hostname.includes("github.io") && !window.location.hostname.includes("localhost")) {
        document.body.innerHTML = "<div style='color:white;text-align:center;padding-top:100px;'>Access Denied</div>";
        throw new Error("Unauthorized");
    }
})();

window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value.trim();
    if(!q) return;

    const resContainer = document.getElementById('resultsContainer');
    resContainer.innerHTML = `<div class="loader-container"><div class="radar"></div><p style="font-size:0.7rem;margin-top:15px;color:var(--primary);">ANALYZING TRENDS...</p></div>`;

    try {
        const response = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await response.json();
        if(data && data[1]) {
            renderResults(data[1]);
        }
    } catch (e) {
        resContainer.innerHTML = "<p style='text-align:center;color:red;'>Sync Error. Try again.</p>";
    }
}

function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = ''; // This stops the syncing animation
    
    list.forEach((item, i) => {
        const words = item.split(' ').length;
        const grade = words >= 4 ? "A+" : (words >= 3 ? "B" : "C");
        const isLocked = (grade === "A+" && !window.isPremium && i > 1);

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div style="flex:1;">
                <div style="font-size:0.6rem; font-weight:bold; color:var(--primary); margin-bottom:4px;">${grade === 'A+' ? '★ TOP TIER' : 'MARKET DATA'}</div>
                <div class="${isLocked ? 'premium-blur' : ''}" style="font-weight:700; font-size:0.95rem;">
                    ${isLocked ? 'HIDDEN PREMIUM NICHE' : item}
                </div>
            </div>
            <div class="item-right" style="display:flex; align-items:center; gap:12px;">
                <div class="score-circle grade-${grade.charAt(0)}">${grade}</div>
                ${isLocked ? 
                    `<button onclick="window.unlockPremium()" class="lock-btn"><i class="fas fa-lock"></i></button>` : 
                    `<button class="save-btn" onclick="window.saveGem('${item}')">+</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

window.unlockPremium = function() {
    if(confirm("Watch an ad to unlock all A+ data?")) {
        window.isPremium = true;
        window.startSearch();
    }
}

window.saveGem = function(n) {
    alert("Niche Saved: " + n);
}
