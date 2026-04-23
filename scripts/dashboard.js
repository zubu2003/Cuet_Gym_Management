// Dashboard JS - Fetches real data from backend
const API_BASE = 'http://localhost:5000/api';

// Get current student from localStorage (set after login)
let currentStudentId = localStorage.getItem('studentId');
let currentStudentName = localStorage.getItem('studentName');
let token = localStorage.getItem('token');
let timerInterval = null;

// Check if user is logged in
function checkAuth() {
    if (!token || !currentStudentId) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// API fetch with authentication
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
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
    }
    
    return response.json();
}

function formatLocalDate(dateInput) {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function updateSessionTimer(activeSession) {
    const timerElement = document.getElementById('time-remaining');
    if (!timerElement) return;

    if (!activeSession || !activeSession.timestamp) {
        timerElement.textContent = 'Scan QR to check in';
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        return;
    }

    const entryTimestamp = Number(activeSession.timestamp);
    const oneHourMs = 60 * 60 * 1000;

    const render = () => {
        const elapsed = Date.now() - entryTimestamp;
        const remaining = Math.max(0, oneHourMs - elapsed);
        const totalSeconds = Math.floor(remaining / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        timerElement.textContent = `${minutes}:${seconds}`;
    };

    render();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(render, 1000);
}

// Load dashboard data
async function loadDashboardData() {
    if (!checkAuth()) return;
    
    // Set welcome name
    document.getElementById('welcomeName').textContent = `Hi, ${currentStudentName || 'Student'}!`;
    try {
        // Fetch gym status
        const activeSessions = await apiFetch('/logs/active');
        const currentCount = activeSessions.length;
        const maxCapacity = 40;
        const percentage = (currentCount / maxCapacity) * 100;
        
        document.getElementById('current-capacity').textContent = currentCount;
        document.getElementById('gymCapacity').textContent = `${currentCount} / ${maxCapacity}`;
        document.getElementById('capacityBar').style.width = `${percentage}%`;
        
        if (percentage < 70) {
            document.getElementById('capacityStatus').innerHTML = '✅ Not Crowded';
            document.getElementById('capacityStatus').className = 'live-status-state status-ok';
        } else if (percentage < 90) {
            document.getElementById('capacityStatus').innerHTML = '⚠️ Getting Crowded';
            document.getElementById('capacityStatus').className = 'live-status-state status-warning';
        } else {
            document.getElementById('capacityStatus').innerHTML = '🔴 Very Crowded';
            document.getElementById('capacityStatus').className = 'live-status-state status-danger';
        }
        
        // Check if current user is inside
        const userInside = activeSessions.find(s => s.studentId === currentStudentId);
        const gymInsideStatus = document.getElementById('gymInsideStatus');
        if (userInside) {
            gymInsideStatus.innerHTML = '✅ You are currently INSIDE the gym';
            gymInsideStatus.className = 'user-status-green';
        } else {
            gymInsideStatus.innerHTML = '❌ You are OUTSIDE the gym';
            gymInsideStatus.className = 'user-status-red';
        }

        updateSessionTimer(userInside || null);
        
    } catch (err) {
        console.error('Error loading gym status:', err);
        updateSessionTimer(null);
    }
    
    // Load today's workouts
    try {
        const workouts = await apiFetch(`/workout/${currentStudentId}`);
        const today = formatLocalDate(new Date());
        const todayWorkouts = workouts.filter(w => w.date === today);
        
        const workoutList = document.getElementById('todayWorkoutList');
        if (todayWorkouts.length === 0) {
            workoutList.innerHTML = '<li>No workouts planned for today</li>';
        } else {
            workoutList.innerHTML = todayWorkouts.slice(0, 4).map(w => `
                <li>${w.equipment} <span class="workout-value">${w.sets} sets × ${w.reps} reps</span></li>
            `).join('');
        }
    } catch (err) {
        console.error('Error loading workouts:', err);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDashboardData();
    // Refresh every 30 seconds
    setInterval(loadDashboardData, 30000);
});