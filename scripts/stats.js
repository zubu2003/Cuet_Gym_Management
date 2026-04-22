// stats.js – User personal stats using backend API
const API_BASE = 'https://gymmanagementbackend.vercel.app//api';

// Get current student from localStorage (set after login)
let currentStudentId = localStorage.getItem('studentId');
let token = localStorage.getItem('token');
let allWorkouts = [];
let selectedPeriod = 'weekly';

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

function formatMinutes(totalMinutes) {
    const safeMinutes = Number(totalMinutes) || 0;
    const hours = Math.floor(safeMinutes / 60);
    const minutes = safeMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function getPeriodFilteredWorkouts(workouts, period) {
    if (!Array.isArray(workouts)) return [];

    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const start = new Date(now);

    if (period === 'weekly') {
        start.setDate(now.getDate() - 6);
    } else if (period === 'monthly') {
        start.setMonth(now.getMonth() - 1);
        start.setDate(start.getDate() + 1);
    } else if (period === 'yearly') {
        start.setFullYear(now.getFullYear() - 1);
        start.setDate(start.getDate() + 1);
    } else {
        return workouts;
    }

    start.setHours(0, 0, 0, 0);
    return workouts.filter(w => {
        if (!w.date) return false;
        const dateObj = new Date(w.date);
        if (Number.isNaN(dateObj.getTime())) return false;
        return dateObj >= start && dateObj <= now;
    });
}

function updateSummaryFromWorkouts(workouts) {
    const totalTime = workouts.reduce((sum, w) => sum + (Number(w.duration) || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (Number(w.calories) || 0), 0);
    const totalWorkouts = workouts.length;
    const daysSet = new Set(workouts.map(w => w.date).filter(Boolean));

    const totalTimeElem = document.getElementById('totalTime');
    const totalCaloriesElem = document.getElementById('totalCalories');
    const totalWorkoutsElem = document.getElementById('totalWorkouts');
    const daysAttendedElem = document.getElementById('daysAttended');

    if (totalTimeElem) totalTimeElem.textContent = formatMinutes(totalTime);
    if (totalCaloriesElem) totalCaloriesElem.textContent = totalCalories;
    if (totalWorkoutsElem) totalWorkoutsElem.textContent = totalWorkouts;
    if (daysAttendedElem) daysAttendedElem.textContent = daysSet.size;
}

function updateWeeklyChartFromWorkouts(workouts) {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);

    workouts.forEach(w => {
        if (!w.date) return;
        const dateObj = new Date(w.date);
        if (Number.isNaN(dateObj.getTime())) return;
        if (dateObj < weekStart || dateObj > today) return;

        let dayIndex = dateObj.getDay();
        dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        if (dayIndex >= 0 && dayIndex < 7) counts[dayIndex]++;
    });

    const barContainer = document.querySelector('.chart-bars');
    if (!barContainer) return;

    const bars = barContainer.querySelectorAll('.bar-fill');
    const values = barContainer.querySelectorAll('.bar-value');
    const maxCount = Math.max(...counts, 1);

    for (let i = 0; i < bars.length && i < counts.length; i++) {
        const percentage = (counts[i] / maxCount) * 100;
        bars[i].style.height = `${percentage}%`;
        if (values[i]) values[i].textContent = `${counts[i]} workouts`;
    }
}

function updatePeriodLabels(period) {
    const chartTitle = document.querySelector('.stats-chart h4');
    const equipmentText = document.querySelector('.stats-equipment p');

    if (chartTitle) {
        if (period === 'monthly') chartTitle.textContent = 'Monthly Activity';
        else if (period === 'yearly') chartTitle.textContent = 'Yearly Activity';
        else chartTitle.textContent = 'Weekly Activity';
    }

    if (equipmentText) {
        if (period === 'monthly') equipmentText.textContent = 'Number of times each equipment was used this month';
        else if (period === 'yearly') equipmentText.textContent = 'Number of times each equipment was used this year';
        else equipmentText.textContent = 'Number of times each equipment was used this week';
    }
}

function renderStatsForSelectedPeriod() {
    const filtered = getPeriodFilteredWorkouts(allWorkouts, selectedPeriod);
    updateSummaryFromWorkouts(filtered);
    updateWeeklyChartFromWorkouts(filtered);
    updateEquipmentUsageFromWorkouts(filtered);
    updatePeriodLabels(selectedPeriod);
}

function setupPeriodButtons() {
    const buttons = document.querySelectorAll('.period-btn');
    if (!buttons.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const periodText = this.textContent.trim().toLowerCase();
            if (periodText.includes('month')) selectedPeriod = 'monthly';
            else if (periodText.includes('year')) selectedPeriod = 'yearly';
            else selectedPeriod = 'weekly';

            renderStatsForSelectedPeriod();
        });
    });
}

function updateEquipmentUsageFromWorkouts(workouts) {
    const equipmentList = document.querySelector('.equipment-list');
    if (!equipmentList) return;

    const equipmentCount = {};
    workouts.forEach(w => {
        if (!w.equipment) return;
        equipmentCount[w.equipment] = (equipmentCount[w.equipment] || 0) + 1;
    });

    const sorted = Object.entries(equipmentCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (sorted.length === 0) {
        equipmentList.innerHTML = `
            <div class="equipment-item">
                <div class="equipment-info">
                    <span class="material-icons">fitness_center</span>
                    <span>No workout data yet</span>
                </div>
                <span class="equipment-count">0 times</span>
            </div>
        `;
        return;
    }

    equipmentList.innerHTML = sorted.map(([name, count]) => `
        <div class="equipment-item">
            <div class="equipment-info">
                <span class="material-icons">fitness_center</span>
                <span>${name}</span>
            </div>
            <span class="equipment-count">${count} times</span>
        </div>
    `).join('');
}

async function loadUserStats() {
    if (!checkAuth()) return;

    try {
        allWorkouts = await apiFetch(`/workout/${currentStudentId}`);
        renderStatsForSelectedPeriod();
    } catch (err) {
        console.error('Stats error:', err);
        allWorkouts = [];
        updateSummaryFromWorkouts([]);
        updateWeeklyChartFromWorkouts([]);
        updateEquipmentUsageFromWorkouts([]);
    }
}

// Load stats on page load
document.addEventListener('DOMContentLoaded', () => {
    setupPeriodButtons();
    loadUserStats();
});