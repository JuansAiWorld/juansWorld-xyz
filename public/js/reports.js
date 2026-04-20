// Reports list page
let currentPage = 1;
let currentOpponent = '';

document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    const isAuthed = await checkAuth();
    if (!isAuthed) {
        window.location.href = '/login.html';
        return;
    }
    
    // Load reports
    loadReports();
    
    // Filter handlers
    document.getElementById('filter-btn').addEventListener('click', () => {
        currentOpponent = document.getElementById('opponent-filter').value;
        currentPage = 1;
        loadReports();
    });
    
    document.getElementById('clear-btn').addEventListener('click', () => {
        document.getElementById('opponent-filter').value = '';
        currentOpponent = '';
        currentPage = 1;
        loadReports();
    });
});

async function loadReports() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const list = document.getElementById('reports-list');
    const pagination = document.getElementById('pagination');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    list.style.display = 'none';
    pagination.style.display = 'none';
    
    try {
        let url = `${API_BASE}/reports?page=${currentPage}`;
        if (currentOpponent) {
            url += `&opponent=${encodeURIComponent(currentOpponent)}`;
        }
        
        const response = await fetch(url, { credentials: 'same-origin' });
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Failed to load reports');
        }
        
        const data = await response.json();
        
        // Update username
        document.getElementById('username').textContent = data.user;
        
        // Show admin link if admin
        if (data.role === 'admin') {
            document.getElementById('admin-link').style.display = 'inline';
        }

        // Show/hide clear button
        document.getElementById('clear-btn').style.display = currentOpponent ? 'inline-block' : 'none';
        
        // Render reports
        if (data.reports.length === 0) {
            loading.textContent = currentOpponent ? 'No reports found matching your filter.' : 'No reports available yet.';
            return;
        }
        
        list.innerHTML = data.reports.map(report => `
            <a href="/report.html?id=${report.slug}" class="report-card">
                <div class="report-info">
                    <h3>${escapeHtml(report.title)}</h3>
                    <span class="date">${report.date_formatted}</span>
                </div>
                <span class="report-arrow">→</span>
            </a>
        `).join('');
        
        // Render pagination
        if (data.total_pages > 1) {
            pagination.innerHTML = `
                <button ${currentPage <= 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">← Prev</button>
                <span>Page ${data.page} of ${data.total_pages}</span>
                <button ${currentPage >= data.total_pages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next →</button>
            `;
            pagination.style.display = 'flex';
        }
        
        loading.style.display = 'none';
        list.style.display = 'flex';
        
    } catch (err) {
        loading.style.display = 'none';
        error.textContent = 'Error loading reports. Please try again.';
        error.style.display = 'block';
    }
}

function changePage(page) {
    currentPage = page;
    loadReports();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
