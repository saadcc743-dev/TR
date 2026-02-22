/**
 * TubeRadar Pro - Niche Scanner Logic
 * Domain: quickpromptget.blogspot.com
 * Version: 2026.FINAL
 */

const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
const ALLOWED_DOMAINS = ["saadcc743-dev.github.io", "quickpromptget.blogspot.com"]; 
window.isPremium = false;

// 1. SECURITY: Domain Lock
(function() {
    const host = window.location.hostname;
    const isLocal = host === '127.0.0.1' || host === 'localhost';
    if (!isLocal && !ALLOWED_DOMAINS.some(d => host.includes(d))) {
        document.body.innerHTML = `<div style="padding:50px; text-align:center; color:#ff7675; font-family:sans-serif;"><h3>Security Access Denied</h3><p>This tool is licensed only for quickpromptget.blogspot.com</p></div>`;
        throw new Error("Unauthorized Domain");
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    updateSavedUI();
    // Live User Simulation
    setInterval(() => {
        const count = 180 + Math.floor(Math.random() * 45);
        const el = document.getElementById('liveCount');
        if(el) el.innerText = `● ${count} Radars Active`;
    }, 5000);
});

// 2. THE SEARCH ENGINE
window.startSearch = async function() {
    const input = document.getElementById('keywordInput');
    const q = input.value.trim().toLowerCase();
    if(!q) return;

    const container = document.getElementById('resultsContainer');
    // Show Radar Loader
    container.innerHTML = `
        <div class="radar-loader">
            <div class="radar-circle"></div>
            <p style="color:var(--primary); font-size:0.75rem; font-weight:700; margin-top:15px; letter-spacing:1px;">
                SYNCING SATELLITE DATA...
            </p>
        </div>`;
    
    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        
        if (data && data[1]) {
            // Artificial delay to make the "Scanner" feel real
            setTimeout(() => renderResults(data[1].map(item => [item])), 1000);
        } else {
            container.innerHTML = "<p style='text-align:center; padding:20px;'>No data found for this niche.</p>";
        }
    } catch (e) { 
        container.innerHTML = "<p style='text-align:center; color:var(--danger); padding:20px;'>Connection lost. Retrying...</p>"; 
    }
}

// 3. THE RENDERER: Handles Grade Logic and Dynamic Blur
function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    if(!container) return;
    container.innerHTML = '';
    
    list.forEach((item, i) => {
        const text = item[0];
        const words = text.split(' ').length;
        
        // 2026 Grading Algorithm
        let grade = "C";
        if (words >= 4) grade = "A+";
        else if (words >= 3) grade = "B";

        // Blur A+ niches for non-premium users (starts after 2nd result)
        const isLocked = (grade === "A+" && !window.isPremium && i > 1);
        
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div style="flex:1;">
                <span style="font-size:0.65rem; font-weight:800; color:${grade === 'A+' ? 'var(--primary)' : 'var(--accent)'};">
                    ${grade === 'A+' ? '🔥 EXPLODING TREND' : 'STABLE GROWTH'}
                </span>
                <div class="${isLocked ? 'premium-blur' : ''}" style="margin-top:5px; font-weight:600;">
                    ${isLocked ? 'PREMIUM HIDDEN NICHE' : text}
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

// 4. PREMIUM UNLOCK ENGINE
window.unlockPremium = function() {
    const confirmUnlock = confirm("Unlock all A+ High-Growth niches by watching a quick sponsored ad?");
    if(confirmUnlock) {
        window.isPremium = true;
        alert("Premium Access Granted for this session!");
        // Instant Refresh
        window.startSearch(); 
    }
}

// 5. SAVED GEMS STORAGE
window.saveGem = function(niche) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(niche)) { 
        gems.push(niche); 
        localStorage.setItem('trGems', JSON.stringify(gems)); 
        updateSavedUI(); 
    }
}

window.removeGem = function(niche) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]").filter(g => g !== niche);
    localStorage.setItem('trGems', JSON.stringify(gems));
    updateSavedUI();
}

function updateSavedUI() {
    const list = document.getElementById('alertsList');
    if(!list) return;
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    
    if (gems.length === 0) {
        list.innerHTML = `<p style="font-size:0.7rem; color:#555; text-align:center; padding:10px;">Research Bin Empty</p>`;
        return;
    }

    list.innerHTML = gems.map(x => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:6px; margin-bottom:6px; border-right:2px solid var(--primary);">
            <span style="font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:150px;">💎 ${x}</span>
            <i class="fas fa-trash-alt" onclick="window.removeGem('${x}')" style="color:var(--danger); cursor:pointer; font-size:0.8rem;"></i>
        </div>
    `).reverse().join('');
}

// 6. CSV EXPORT
window.exportCSV = function() {
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(gems.length === 0) return alert("Save some niche ideas first!");
    
    const csvContent = "data:text/csv;charset=utf-8,TubeRadar Export\n" + gems.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "tuberadar_research.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
