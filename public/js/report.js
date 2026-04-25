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
        
        if (report.type === 'pdf') {
            content.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <h1 style="font-size: 1.75rem; margin-bottom: 0.5rem;">${escapeHtml(report.title)}</h1>
                    <p style="color: var(--text-muted); font-size: 0.875rem;">${report.date_formatted}</p>
                </div>
                <div style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-dark);">
                    <iframe 
                        src="${report.pdfUrl}" 
                        style="width: 100%; height: 70vh; border: none;"
                        title="${escapeHtml(report.title)}">
                    </iframe>
                </div>
                <div style="margin-top: 1rem;">
                    <a href="${report.pdfUrl}" target="_blank" download class="btn btn-secondary" style="width: auto; padding: 0.5rem 1rem; font-size: 0.875rem;">
                        Download PDF
                    </a>
                </div>
            `;
        } else {
            content.innerHTML = report.html;
        }
        
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
