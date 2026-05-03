// Authentication utilities
const API_BASE = '/api';

// Check if user is authenticated
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/reports`, {
            credentials: 'same-origin'
        });
        return response.ok;
    } catch (e) {
        return false;
    }
}

// Redirect to login if not authenticated
async function requireAuth() {
    const isAuthed = await checkAuth();
    if (!isAuthed) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
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
                    const params = new URLSearchParams(window.location.search);
                    const redirect = params.get('redirect');
                    window.location.href = redirect || '/flowpace/';
                } else {
                    errorDiv.textContent = data.error || 'Login failed';
                    errorDiv.style.display = 'block';
                }
            } catch (err) {
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
            
            window.location.href = '/login.html';
        });
    }
});
