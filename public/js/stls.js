// STL files list page
let currentPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
    const isAuthed = await checkAuth();
    if (!isAuthed) {
        window.location.href = '/login.html';
        return;
    }
    loadStls();
});

async function loadStls() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const list = document.getElementById('stls-list');
    const pagination = document.getElementById('pagination');

    loading.style.display = 'block';
    error.style.display = 'none';
    list.style.display = 'none';
    pagination.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/stls?page=${currentPage}`, { credentials: 'same-origin' });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Failed to load files');
        }

        const data = await response.json();

        document.getElementById('username').textContent = data.user;

        if (data.role === 'admin') {
            document.getElementById('admin-link').style.display = 'inline';
        }

        if (data.stls.length === 0) {
            loading.textContent = 'No STL files available yet.';
            return;
        }

        list.innerHTML = data.stls.map(stl => {
            const size = stl.fileSize ? formatBytes(stl.fileSize) : '';
            return `
            <a href="/stl.html?id=${stl.id}" class="report-card">
                <div class="report-info">
                    <h3>${escapeHtml(stl.title)} <span class="stl-badge">STL</span></h3>
                    <span class="date">${formatDate(stl.uploadedAt)}${size ? ' · ' + size : ''}</span>
                </div>
                <span class="report-arrow">→</span>
            </a>
        `}).join('');

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
        error.textContent = 'Error loading files. Please try again.';
        error.style.display = 'block';
    }
}

function changePage(page) {
    currentPage = page;
    loadStls();
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
