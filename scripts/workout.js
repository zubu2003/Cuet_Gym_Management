
const API_BASE = 'http://localhost:5000/api';

// For now, hardcode a student that exists in  database
let currentStudentId = '2021001';
let currentStudentName = 'Sazid Ahmed';

let workouts = [];

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

// Set today's date as default
const today = new Date().toISOString().split('T')[0];
if (workoutDate) workoutDate.value = today;

// Load workouts from backend
async function loadWorkouts() {
  try {
    const response = await fetch(`${API_BASE}/workout/${currentStudentId}`);
    if (!response.ok) throw new Error('Failed to load workouts');
    workouts = await response.json();
    renderWorkouts();
    updateSummary();
  } catch (err) {
    console.error('Load workouts error:', err);
    workouts = [];
    renderWorkouts();
  }
}

// Render workout history grouped by date
function renderWorkouts() {
  if (!workoutContainer) return;
  if (workouts.length === 0) {
    workoutContainer.innerHTML = `
      <div class="card no-workouts">
        <span class="material-icons">fitness_center</span>
        <p>No workouts found</p>
        <small>Click "Add New Workout" to start tracking your progress!</small>
      </div>
    `;
    return;
  }

  // Group by date
  const grouped = {};
  workouts.forEach(w => {
    if (!grouped[w.date]) grouped[w.date] = [];
    grouped[w.date].push(w);
  });

  const sortedDates = Object.keys(grouped).sort().reverse();
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
  const d = new Date(dateStr);
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
  try {
    const response = await fetch(`${API_BASE}/workout/stats/${currentStudentId}`);
    if (!response.ok) throw new Error();
    const stats = await response.json();
    if (totalTimeEl) {
      const hours = Math.floor(stats.totalTime / 60);
      const mins = stats.totalTime % 60;
      totalTimeEl.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    if (totalCaloriesEl) totalCaloriesEl.textContent = stats.totalCalories || 0;
    if (totalWorkoutsEl) totalWorkoutsEl.textContent = stats.totalWorkouts || 0;
  } catch (err) {
    console.warn('Summary update failed', err);
  }
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
    let response;
    if (id) {
      // Update existing workout
      response = await fetch(`${API_BASE}/workout/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      });
    } else {
      // Add new workout
      response = await fetch(`${API_BASE}/workout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      });
    }
    if (!response.ok) throw new Error('Save failed');
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
    const response = await fetch(`${API_BASE}/workout/${currentDeleteId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Delete failed');
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
  workoutDate.value = new Date().toISOString().split('T')[0];
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
  loadWorkouts();
  if (addWorkoutBtn) addWorkoutBtn.addEventListener('click', openAddWorkoutModal);
  if (workoutForm) workoutForm.addEventListener('submit', saveWorkout);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', deleteWorkout);
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  // Close modals on X click
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal();
      closeDeleteModal();
    });
  });
  // Click outside to close
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
    const deleteModal = document.getElementById('deleteModal');
    if (e.target === deleteModal) closeDeleteModal();
  });
});