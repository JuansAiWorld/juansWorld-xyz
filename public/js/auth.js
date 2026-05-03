// Authentication utilities
const API_BASE = '/api';

let cachedUser = null;
let cachedAt = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

// Check if user is authenticated and return basic status
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'same-origin'
        });
        if (!response.ok) {
            console.log('[auth] checkAuth:', response.status, 'not authenticated');
        }
        return response.ok;
    } catch (e) {
        console.error('[auth] checkAuth error:', e);
        return false;
    }
}

// Get current user info (with short-term caching)
async function getCurrentUser() {
    const now = Date.now();
    if (cachedUser && cachedAt + CACHE_TTL_MS > now) {
        return cachedUser;
    }
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'same-origin'
        });
        if (!response.ok) {
            console.log('[auth] getCurrentUser:', response.status, 'not authenticated');
            cachedUser = null;
            return null;
        }
        const data = await response.json();
        cachedUser = data;
        cachedAt = now;
        return data;
    } catch (e) {
        console.error('[auth] getCurrentUser error:', e);
        cachedUser = null;
        return null;
    }
}

// Clear cached user (call after login/logout)
function clearAuthCache() {
    cachedUser = null;
    cachedAt = 0;
}

// Redirect to login if not authenticated
async function requireAuth() {
    const user = await getCurrentUser();
    if (!user || !user.authenticated) {
        const currentPath = window.location.pathname + window.location.search;
        const redirectUrl = currentPath !== '/login.html' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
        window.location.href = '/login.html' + redirectUrl;
        return false;
    }
    return true;
}

// Update all elements that should show the current username
async function updateUserDisplay() {
    const user = await getCurrentUser();
    const username = user?.user || 'Guest';
    const role = user?.role || 'user';

    document.querySelectorAll('[data-username]').forEach(el => {
        el.textContent = username;
    });

    document.querySelectorAll('[data-role]').forEach(el => {
        el.textContent = role;
    });

    // Show admin links for admins
    if (role === 'admin') {
        document.querySelectorAll('[data-admin-only]').forEach(el => {
            el.style.display = '';
        });
    }
}

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error-message');
            
            try {
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    clearAuthCache();
                    const params = new URLSearchParams(window.location.search);
                    const redirect = params.get('redirect');
                    // Smart redirect: admin -> dashboard, others -> reports
                    let destination = redirect;
                    if (!destination) {
                        destination = data.role === 'admin' ? '/dashboard.html' : '/reports.html';
                    }
                    // DEBUG: log redirect for troubleshooting
                    console.log('[auth] login success, redirecting to:', destination, 'role:', data.role);
                    window.location.href = destination;
                } else {
                    console.error('[auth] login failed:', response.status, data);
                    errorDiv.textContent = data.error || `Login failed (${response.status})`;
                    errorDiv.style.display = 'block';
                }
            } catch (err) {
                console.error('[auth] login error:', err);
                errorDiv.textContent = 'Network error. Please try again.';
                errorDiv.style.display = 'block';
            }
        });
    }
    
    // Logout handler
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                await fetch(`${API_BASE}/logout`, {
                    method: 'POST',
                    credentials: 'same-origin'
                });
            } catch (e) {
                // Ignore errors
            }
            
            clearAuthCache();
            window.location.href = '/login.html';
        });
    }

    // Update user display on pages that have user elements
    updateUserDisplay();
});
