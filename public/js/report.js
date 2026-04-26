// Single report view page
const urlParams = new URLSearchParams(window.location.search);
const reportId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', async () => {
    if (!reportId) {
        window.location.href = '/reports.html';
        return;
    }
    
    // Check auth
    const isAuthed = await checkAuth();
    if (!isAuthed) {
        window.location.href = '/login.html';
        return;
    }
    
    loadReport();
});

async function loadReport() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const content = document.getElementById('report-content');
    
    try {
        const response = await fetch(`${API_BASE}/report?id=${encodeURIComponent(reportId)}`, {
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            if (response.status === 404) {
                loading.style.display = 'none';
                error.textContent = 'Report not found.';
                error.style.display = 'block';
                return;
            }
            throw new Error('Failed to load report');
        }
        
        const data = await response.json();
        const report = data.report;
        
        loading.style.display = 'none';
        content.innerHTML = report.html;
        content.style.display = 'block';
        
    } catch (err) {
        loading.style.display = 'none';
        error.textContent = 'Error loading report. Please try again.';
        error.style.display = 'block';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
