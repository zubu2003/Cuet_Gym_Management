// Workout Tracker - Uses logged-in student from localStorage
const API_BASE = 'https://gymmanagementbackend.vercel.app//api';

// Get current student from localStorage (set after login)
let currentStudentId = localStorage.getItem('studentId');
let currentStudentName = localStorage.getItem('studentName');
let token = localStorage.getItem('token');

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

let workouts = [];
let selectedDateFilter = 'all';

// DOM elements
const workoutContainer = document.getElementById('workoutHistoryContainer');
const totalTimeEl = document.getElementById('totalTime');
const totalCaloriesEl = document.getElementById('totalCalories');
const totalWorkoutsEl = document.getElementById('totalWorkouts');

// Modal elements
const modal = document.getElementById('workoutModal');
const modalTitle = document.getElementById('modalTitle');
const workoutForm = document.getElementById('workoutForm');
const workoutId = document.getElementById('workoutId');
const equipmentName = document.getElementById('equipmentName');
const sets = document.getElementById('sets');
const reps = document.getElementById('reps');
const duration = document.getElementById('duration');
const calories = document.getElementById('calories');
const workoutDate = document.getElementById('workoutDate');
const notes = document.getElementById('notes');
const cancelBtn = document.getElementById('cancelBtn');
const addWorkoutBtn = document.getElementById('addWorkoutBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

let currentDeleteId = null;

function formatLocalDate(dateInput) {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Set today's date as default
if (workoutDate) workoutDate.value = formatLocalDate(new Date());

// Load workouts from backend
async function loadWorkouts() {
    if (!checkAuth()) return;
    
    try {
        workouts = await apiFetch(`/workout/${currentStudentId}`);
        workouts.sort((a, b) => parseWorkoutDate(b.date) - parseWorkoutDate(a.date));
        applyWorkoutFilter();
    } catch (err) {
        console.error('Load workouts error:', err);
        workouts = [];
        applyWorkoutFilter();
    }
}

function getDateOnly(dateInput) {
    const date = parseWorkoutDate(dateInput);
    date.setHours(0, 0, 0, 0);
    return date;
}

function parseWorkoutDate(dateInput) {
    if (!dateInput) return new Date('');
    if (dateInput instanceof Date) return new Date(dateInput);

    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const [year, month, day] = dateInput.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    return new Date(dateInput);
}

function getFilteredWorkouts() {
    if (selectedDateFilter === 'all') return workouts;

    const todayDate = getDateOnly(new Date());

    if (selectedDateFilter === '0') {
        const todayStr = formatLocalDate(todayDate);
        return workouts.filter(w => w.date === todayStr);
    }

    if (selectedDateFilter === '1') {
        const yesterday = new Date(todayDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatLocalDate(yesterday);
        return workouts.filter(w => w.date === yesterdayStr);
    }

    if (selectedDateFilter === '7') {
        const start = new Date(todayDate);
        start.setDate(start.getDate() - 6);
        return workouts.filter(w => {
            if (!w.date) return false;
            const workoutDate = getDateOnly(w.date);
            return workoutDate >= start && workoutDate <= todayDate;
        });
    }

    return workouts;
}

// Render workout history grouped by date
function renderWorkouts(list = workouts) {
    if (!workoutContainer) return;
    if (list.length === 0) {
        workoutContainer.innerHTML = `
            <div class="card no-workouts">
                <span class="material-icons">fitness_center</span>
                <p>No workouts found</p>
                <small>No workouts for selected period.</small>
            </div>
        `;
        return;
    }

    // Group by date
    const grouped = {};
    list.forEach(w => {
        if (!grouped[w.date]) grouped[w.date] = [];
        grouped[w.date].push(w);
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => parseWorkoutDate(b) - parseWorkoutDate(a));
    let html = '';
    sortedDates.forEach(date => {
        const dayWorkouts = grouped[date];
        const totalCals = dayWorkouts.reduce((s, w) => s + w.calories, 0);
        const totalMins = dayWorkouts.reduce((s, w) => s + w.duration, 0);
        html += `
            <div class="workout-history">
                <div class="workout-date-header">
                    <h4>${formatDate(date)}</h4>
                    <span>🏋️ ${dayWorkouts.length} workouts | 🔥 ${totalCals} cal | ⏱️ ${totalMins} min</span>
                </div>
                <div class="workout-list">
        `;
        dayWorkouts.forEach(w => {
            html += `
                <div class="workout-item">
                    <span class="material-icons">fitness_center</span>
                    <div class="workout-info">
                        <strong>${escapeHtml(w.equipment)}</strong>
                        <div class="workout-meta">
                            <span><span class="material-icons">fitness_center</span> ${w.sets} sets</span>
                            <span><span class="material-icons">repeat</span> ${w.reps} reps</span>
                            <span><span class="material-icons">timer</span> ${w.duration} min</span>
                            <span><span class="material-icons">local_fire_department</span> ${w.calories} cal</span>
                        </div>
                        ${w.notes ? `<div class="workout-meta">📝 ${escapeHtml(w.notes)}</div>` : ''}
                    </div>
                    <div class="workout-actions">
                        <button class="edit-workout" data-id="${w._id}">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="delete-workout" data-id="${w._id}">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
    });
    workoutContainer.innerHTML = html;

    // Attach event listeners to edit/delete buttons
    document.querySelectorAll('.edit-workout').forEach(btn => {
        btn.addEventListener('click', () => editWorkout(btn.dataset.id));
    });
    document.querySelectorAll('.delete-workout').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
    });
}

function formatDate(dateStr) {
    const d = parseWorkoutDate(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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

// Update summary stats from backend
async function updateSummary() {
    const filtered = getFilteredWorkouts();
    const totalMinutes = filtered.reduce((sum, w) => sum + (Number(w.duration) || 0), 0);
    const totalCalories = filtered.reduce((sum, w) => sum + (Number(w.calories) || 0), 0);
    const totalCount = filtered.length;

    if (totalTimeEl) {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        totalTimeEl.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    if (totalCaloriesEl) totalCaloriesEl.textContent = totalCalories;
    if (totalWorkoutsEl) totalWorkoutsEl.textContent = totalCount;
}

function applyWorkoutFilter() {
    const filtered = getFilteredWorkouts();
    renderWorkouts(filtered);
    updateSummary();
}

function setupDateFilterButtons() {
    const dateButtons = document.querySelectorAll('.date-btn');
    if (!dateButtons.length) return;

    dateButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            dateButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedDateFilter = this.dataset.days || 'all';
            applyWorkoutFilter();
        });
    });
}

// Save workout (add or update)
async function saveWorkout(e) {
    e.preventDefault();
    const id = workoutId.value;
    const workoutData = {
        studentId: currentStudentId,
        studentName: currentStudentName,
        equipment: equipmentName.value.trim(),
        sets: parseInt(sets.value),
        reps: reps.value.trim(),
        duration: parseInt(duration.value),
        calories: parseInt(calories.value),
        date: workoutDate.value,
        notes: notes.value.trim()
    };

    try {
        if (id) {
            await apiFetch(`/workout/${id}`, {
                method: 'PUT',
                body: JSON.stringify(workoutData)
            });
        } else {
            await apiFetch('/workout', {
                method: 'POST',
                body: JSON.stringify(workoutData)
            });
        }
        closeModal();
        loadWorkouts();
    } catch (err) {
        alert('Error saving workout: ' + err.message);
    }
}

// Edit workout
async function editWorkout(id) {
    const workout = workouts.find(w => w._id === id);
    if (!workout) return;
    modalTitle.textContent = 'Edit Workout';
    workoutId.value = workout._id;
    equipmentName.value = workout.equipment;
    sets.value = workout.sets;
    reps.value = workout.reps;
    duration.value = workout.duration;
    calories.value = workout.calories;
    workoutDate.value = workout.date;
    notes.value = workout.notes || '';
    modal.style.display = 'flex';
}

// Delete workout
async function deleteWorkout() {
    if (!currentDeleteId) return;
    try {
        await apiFetch(`/workout/${currentDeleteId}`, { method: 'DELETE' });
        closeDeleteModal();
        loadWorkouts();
    } catch (err) {
        alert('Delete failed: ' + err.message);
    }
}

// Modal controls
function openAddWorkoutModal() {
    modalTitle.textContent = 'Add Workout';
    workoutForm.reset();
    workoutId.value = '';
    workoutDate.value = formatLocalDate(new Date());
    modal.style.display = 'flex';
}

function openDeleteModal(id) {
    currentDeleteId = id;
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) deleteModal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) deleteModal.style.display = 'none';
    currentDeleteId = null;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadWorkouts();
    setupDateFilterButtons();
    if (addWorkoutBtn) addWorkoutBtn.addEventListener('click', openAddWorkoutModal);
    if (workoutForm) workoutForm.addEventListener('submit', saveWorkout);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', deleteWorkout);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal();
            closeDeleteModal();
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
        const deleteModal = document.getElementById('deleteModal');
        if (e.target === deleteModal) closeDeleteModal();
    });
});