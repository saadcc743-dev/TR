const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
let isPremium = false;
let selectedNiches = new Set();

// Auto-Load Initial Niches on Start
document.addEventListener('DOMContentLoaded', () => {
    const startupNiches = ["AI Faceless Channels 2026", "Budget Solo Travel Guides", "Passive Income Micro-SaaS", "Aesthetic Desk Setups"];
    renderResults(startupNiches);
    
    // Live Pulse Simulation
    setInterval(() => {
        const liveEl = document.getElementById('liveCount');
        if(liveEl) liveEl.innerText = `● ${120 + Math.floor(Math.random() * 40)} RADARS ACTIVE`;
    }, 4000);

    loadSavedGems();
});

window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value.trim();
    if(!q) return;

    const container = document.getElementById('resultsContainer');
    container.innerHTML = `<div style="text-align:center; padding:20px; color:#00b894;">Scanning satellites...</div>`;

    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data && data[1]) {
            selectedNiches.clear();
            updateCopyBtn();
            renderResults(data[1]);
        }
    } catch (e) {
        // Fallback for testing if Worker is down
        const fallback = [`${q} automation`, `${q} for beginners 2026`, `profitable ${q} ideas`, `secret ${q} strategy`];
        selectedNiches.clear();
        updateCopyBtn();
        renderResults(fallback);
    }
}

function renderResults(list) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    list.forEach((text, i) => {
        const words = text.split(' ').length;
        const grade = words >= 4 ? "A+" : "B";
        const isLocked = (grade === "A+" && !isPremium && i > 0); // Locks A+ after the 1st result
        
        const div = document.createElement('div');
        div.className = `result-item ${selectedNiches.has(text) ? 'selected' : ''}`;
        
        div.onclick = () => {
            if(isLocked) return;
            if(selectedNiches.has(text)) {
                selectedNiches.delete(text);
                div.classList.remove('selected');
            } else {
                selectedNiches.add(text);
                div.classList.add('selected');
            }
            updateCopyBtn();
        };

        div.innerHTML = `
            <div style="flex:1; padding-right:10px;">
                <div class="${isLocked ? 'premium-blur' : ''}" style="font-weight:bold;">
                    ${isLocked ? 'PREMIUM DATA LOCKED' : text}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;" onclick="event.stopPropagation()">
                <div class="score-circle grade-${grade.charAt(0)}">${grade}</div>
                ${isLocked ? 
                    `<button onclick="unlockViaAd()" class="lock-btn"><i class="fas fa-lock"></i></button>` : 
                    `<button onclick="saveGem('${text.replace(/'/g, "\\'")}')" style="background:none; border:1px solid #444; color:white; border-radius:5px; width:35px; height:35px; cursor:pointer;">+</button>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

// Monetization
window.unlockViaAd = function() {
    if(confirm("Watch a short Ad to unlock all Grade A+ Premium Niches?")) {
        // Trigger your AdSense Rewarded logic here
        setTimeout(() => {
            isPremium = true;
            window.startSearch(); // Re-run search unblurred
        }, 1000);
    }
}

// Clipboard Logic
function updateCopyBtn() {
    const btn = document.getElementById('copySelectedBtn');
    btn.style.display = selectedNiches.size > 0 ? 'block' : 'none';
    btn.innerText = `COPY ${selectedNiches.size} SELECTED NICHES`;
}

window.copySelectedToClipboard = function() {
    const textToCopy = Array.from(selectedNiches).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
        const toast = document.getElementById('copyToast');
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2000);
        
        // Clear selection after copy
        selectedNiches.clear();
        updateCopyBtn();
        document.querySelectorAll('.result-item').forEach(el => el.classList.remove('selected'));
    });
}

// Research Bin Logic
window.saveGem = function(text) {
    let gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(!gems.includes(text)) {
        gems.push(text);
        localStorage.setItem('trGems', JSON.stringify(gems));
        loadSavedGems();
    }
}

function loadSavedGems() {
    const list = document.getElementById('alertsList');
    const gems = JSON.parse(localStorage.getItem('trGems') || "[]");
    if(gems.length === 0) { list.innerHTML = "<div style='color:#555; font-size:0.8rem;'>Bin is empty.</div>"; return; }
    
    list.innerHTML = gems.map(x => `
        <div class="saved-item">💎 ${x}</div>
    `).reverse().join('');
}
