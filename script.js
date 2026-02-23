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

    // --- ADDED THIS LINE ---
    isPremium = false; // This ensures every NEW search starts as locked (blurred)

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
        const isLocked = (grade === "A+" && !isPremium && i > 0); 
        
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
        setTimeout(() => {
            isPremium = true;
            // Get current keywords to refresh the list without triggering startSearch's reset
            const q = document.getElementById('keywordInput').value.trim();
            
            // Re-render the existing list with isPremium = true
            // Instead of re-fetching, we just look at the container's current state 
            // or simply force the UI to refresh.
            // The easiest way is to re-run the render logic.
            const currentItems = Array.from(document.querySelectorAll('.result-item')).map(item => {
                // This grabs the text or the locked text
                return item.innerText.split('\n')[0].trim();
            });
            
            // Just re-run startSearch to be clean, but we wrap the reset logic 
            // so we don't fetch twice unnecessarily.
            forceUnlockRender(); 
        }, 1000);
    }
}

// Helper to refresh UI after ad without clearing isPremium
function forceUnlockRender() {
    // This looks for the keywords again but DOES NOT reset isPremium to false
    const q = document.getElementById('keywordInput').value.trim();
    // We call fetch again OR you could save the last data in a variable.
    // For simplicity, we just trigger the search again but keep the 'isPremium' state
    renderCurrentDataUnblurred();
}

async function renderCurrentDataUnblurred() {
    const q = document.getElementById('keywordInput').value.trim();
    const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (data && data[1]) {
        renderResults(data[1]);
    }
}

// ... Rest of your Clipboard and Research Bin Logic remains unchanged ...
