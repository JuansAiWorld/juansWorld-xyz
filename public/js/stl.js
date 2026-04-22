// Single STL file view page
const urlParams = new URLSearchParams(window.location.search);
const stlId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', async () => {
    if (!stlId) {
        window.location.href = '/stls.html';
        return;
    }

    const isAuthed = await checkAuth();
    if (!isAuthed) {
        window.location.href = '/login.html';
        return;
    }

    loadStl();
});

async function loadStl() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const content = document.getElementById('stl-content');

    try {
        const response = await fetch(`${API_BASE}/stls`, { credentials: 'same-origin' });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Failed to load file');
        }

        const data = await response.json();
        const stl = data.stls.find(s => s.id === stlId);

        if (!stl) {
            loading.style.display = 'none';
            error.textContent = 'File not found.';
            error.style.display = 'block';
            return;
        }

        const size = stl.fileSize ? formatBytes(stl.fileSize) : '';

        loading.style.display = 'none';
        content.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h1 style="font-size: 1.75rem; margin-bottom: 0.5rem;">${escapeHtml(stl.title)}</h1>
                <p style="color: var(--text-muted); font-size: 0.875rem;">
                    ${formatDate(stl.uploadedAt)}${size ? ' · ' + size : ''}
                </p>
            </div>
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 2rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🧊</div>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">STL 3D model file</p>
                <a href="/api/stls/${stl.filename}" download class="btn" style="width: auto; padding: 0.75rem 1.5rem;">
                    Download STL
                </a>
            </div>
        `;
        content.style.display = 'block';

    } catch (err) {
        loading.style.display = 'none';
        error.textContent = 'Error loading file. Please try again.';
        error.style.display = 'block';
    }
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
