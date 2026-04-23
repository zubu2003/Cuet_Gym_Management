// Tutorial page – fetches active equipment from backend
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : '/api';
let token = localStorage.getItem('token');

// Check if user is logged in
function checkAuth() {
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

async function apiFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        localStorage.clear();
        window.location.href = 'login.html';
        throw new Error('Session expired');
    }
    
    if (!response.ok) {
        throw new Error('API request failed');
    }
    
    return response.json();
}

async function loadTutorials() {
    if (!checkAuth()) return;
    
    // Show loading state first
    const grid = document.getElementById('equipmentGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading">Loading equipment...</div>';
    }
    
    try {
        const equipment = await apiFetch('/equipment/active');
        renderEquipment(equipment);
    } catch (err) {
        console.error('Load tutorials error:', err);
        if (grid) {
            grid.innerHTML = '<div class="no-equipment">Failed to load tutorials. Make sure backend is running.</div>';
        }
    }
}

function renderEquipment(list) {
    const grid = document.getElementById('equipmentGrid');
    if (!grid) return;
    
    if (list.length === 0) {
        grid.innerHTML = '<div class="no-equipment">No equipment tutorials available yet. Admin will add soon!</div>';
        return;
    }
    
    grid.innerHTML = list.map(e => `
        <div class="equipment-card" data-category="${e.category.toLowerCase()}">
            <div class="equipment-card-top">
                <div class="equipment-icon">${getIcon(e.category)}</div>
            </div>
            <div class="equipment-card-content">
                <div class="equipment-title-row">
                    <h3>${escapeHtml(e.name)}</h3>
                    <span class="status-badge-sm ${e.status === 'active' ? 'active' : 'maintenance'}">
                        ${e.status === 'active' ? 'Active' : 'Maintenance'}
                    </span>
                </div>
                <div class="equipment-category">${e.category}</div>
                ${e.instructions ? `<div class="equipment-instructions">📝 ${escapeHtml(e.instructions.substring(0, 80))}${e.instructions.length > 80 ? '...' : ''}</div>` : ''}
                <button class="watch-tutorial-btn" data-url="${e.tutorial || ''}">
                    <span>▶</span> Watch Tutorial Video
                </button>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.watch-tutorial-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const url = btn.dataset.url;
            if (url) {
                window.open(url, '_blank');
            } else {
                alert('No tutorial video available for this equipment yet.');
            }
        });
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getIcon(category) {
    const icons = {
        'Cardio': '🏃‍♂️',
        'Strength': '💪',
        'Free Weights': '🏋️',
        'Cable': '🔗'
    };
    return icons[category] || '🏋️‍♂️';
}

// Search functionality
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const cards = document.querySelectorAll('.equipment-card');
        cards.forEach(card => {
            const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const category = card.querySelector('.equipment-category')?.textContent.toLowerCase() || '';
            if (name.includes(searchTerm) || category.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Category filters
const categoryBtns = document.querySelectorAll('.category-btn');
categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        categoryBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const category = this.textContent;
        const cards = document.querySelectorAll('.equipment-card');
        
        cards.forEach(card => {
            if (category === 'All Equipment') {
                card.style.display = 'block';
            } else {
                const cardCategory = card.getAttribute('data-category');
                if (cardCategory === category.toLowerCase()) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
});

// Also fetch live gym status for sidebar
async function loadGymStatus() {
    try {
        const response = await fetch(`${API_BASE}/logs/active`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const activeSessions = await response.json();
            const count = activeSessions.length;
            const maxCapacity = 40;
            const statusCountElem = document.getElementById('gymStatusCount');
            const statusStateElem = document.getElementById('gymStatusState');
            
            if (statusCountElem) {
                statusCountElem.textContent = `${count} / ${maxCapacity}`;
            }
            if (statusStateElem) {
                if (count < 30) {
                    statusStateElem.innerHTML = '✅ Not Crowded';
                    statusStateElem.className = 'gym-status-state status-ok';
                } else {
                    statusStateElem.innerHTML = '⚠️ Crowded';
                    statusStateElem.className = 'gym-status-state status-warning';
                }
            }
        }
    } catch (err) {
        console.error('Failed to load gym status:', err);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadTutorials();
    loadGymStatus();
});