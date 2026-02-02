const WORKER_URL = "https://tuberadar-api.tuberadar-api.workers.dev"; 

async function startSearch() {
    const input = document.getElementById('keywordInput');
    const q = input.value.trim();
    if(!q) return;
    
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '📡 Scanning YouTube...';
    
    try {
        // We use 'cors' mode explicitly
        const res = await fetch(`${WORKER_URL}?q=${encodeURIComponent(q)}`, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
        });
        
        const data = await res.json();
        if (data && data[1]) {
            renderResults(data[1].map(item => [item]));
        }
    } catch (e) { 
        console.error("Fetch Error:", e);
        container.innerHTML = "<p style='color:red'>Scan Failed. Check Cloudflare CORS.</p>"; 
    }
}

// Ensure the button is linked
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchBtn').onclick = startSearch;
    loadHourlyHarvest(); // This handles the "Syncing" part
});

async function loadHourlyHarvest() {
    try {
        const res = await fetch(`${WORKER_URL}?get_harvest=true`);
        const data = await res.json();
        document.getElementById('updateTag').innerText = "LIVE";
        if(data.niches) renderResults(data.niches.map(n => [n]));
    } catch (e) {
        document.getElementById('updateTag').innerText = "OFFLINE";
    }
}
// ... rest of your renderResults function remains the same
