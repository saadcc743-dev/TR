const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev";
let isPremium = false;
let selectedItems = new Set();

document.addEventListener('DOMContentLoaded', () => {
    // PRE-LOAD SATELLITE DATA (Shows immediately on start)
    const harvest = ["AI Business Automation", "Vintage Tech Restoration", "Micro-SaaS Development", "Digital Nomad Japan"];
    renderResults(harvest);
    
    // Live Pulse Simulation
    setInterval(() => {
        const liveEl = document.getElementById('liveCount');
        if(liveEl) liveEl.innerText = `● ${120 + Math.floor(Math.random() * 40)} RADARS ACTIVE`;
    }, 5000);
});

window.startSearch = async function() {
    const q = document.getElementById('keywordInput').value.trim().toLowerCase();
    if(!q) return;

    const container = document.getElementById('resultsContainer');
    container.innerHTML = `<div style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin" style="color:var(--primary); font-size:2rem;"></i><p>Scanning...</p></div>`;

    try {
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data && data[1]) {
            selectedItems.clear();
            updateCopyBtn();
            renderResults(data[1]);
        }
    } catch (e) {
        container.innerHTML = "<p style='color:var(--danger);'>Connection error.</p>";
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
        div.className = `result-item ${selectedItems.has(text) ? 'selected' : ''}`;
        
        div.onclick = () => {
            if(isLocked) return;
            if(selectedItems.has(text)) {
                selectedItems.delete(text);
                div.classList.remove('selected');
            } else {
                selectedItems.add(text);
                div.classList.add('selected');
            }
            updateCopyBtn();
        };

        div.innerHTML = `
            <div style="flex:1;">
                <div class="${isLocked ? 'premium-blur' : ''}" style="font-weight:bold;">
                    ${isLocked ? 'PREMIUM DATA LOCKED' : text}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;" onclick="event.stopPropagation()">
                <div class="score-circle grade-${grade[0]}">${grade}</div>
                ${isLocked ? `<button onclick="unlockViaAd()" class="lock-btn"><i class="fas fa-lock"></i></button>` : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

window.unlockViaAd = function() {
    // Place your AdSense Rewarded Video code here
    if(confirm("Watch a short ad to unlock all A+ niches?")) {
        // Trigger AdSense ad, then on finish:
        isPremium = true;
        window.startSearch();
    }
}

function updateCopyBtn() {
    const btn = document.getElementById('copySelectedBtn');
    btn.style.display = selectedItems.size > 0 ? 'block' : 'none';
    btn.innerText = `COPY ${selectedItems.size} SELECTED NICHES`;
}

window.copySelectedToClipboard = function() {
    const blob = Array.from(selectedItems).join('\n');
    navigator.clipboard.writeText(blob).then(() => {
        const toast = document.getElementById('copyToast');
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2000);
    });
}
