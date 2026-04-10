// Workout Tracker page JS
document.addEventListener('DOMContentLoaded', function() {
    // Current user
    const currentUser = {
        id: 'STU001',
        name: 'Sazid'
    };
    
    // Load workouts from localStorage
    let workouts = JSON.parse(localStorage.getItem(`workouts_${currentUser.id}`)) || [];
    
    let currentDeleteId = null;
    let currentFilter = 'all';
    
    // DOM Elements
    const workoutContainer = document.getElementById('workoutHistoryContainer');
    const totalTimeEl = document.getElementById('totalTime');
    const totalCaloriesEl = document.getElementById('totalCalories');
    const totalWorkoutsEl = document.getElementById('totalWorkouts');
    
    // Modal Elements
    const modal = document.getElementById('workoutModal');
    const deleteModal = document.getElementById('deleteModal');
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
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    workoutDate.value = today;
    
    // Save workouts to localStorage
    function saveWorkouts() {
        localStorage.setItem(`workouts_${currentUser.id}`, JSON.stringify(workouts));
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    // Group workouts by date
    function groupWorkoutsByDate(workoutsArray) {
        const grouped = {};
        workoutsArray.forEach(workout => {
            if (!grouped[workout.date]) {
                grouped[workout.date] = [];
            }
            grouped[workout.date].push(workout);
        });
        return grouped;
    }
    
    // Filter workouts based on selected period
    function filterWorkouts() {
        let filtered = [...workouts];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (currentFilter === '0') { // Today
            const todayStr = new Date().toISOString().split('T')[0];
            filtered = filtered.filter(w => w.date === todayStr);
        } else if (currentFilter === '1') { // Yesterday
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            filtered = filtered.filter(w => w.date === yesterdayStr);
        } else if (currentFilter === '7') { // Last 7 days
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filtered = filtered.filter(w => new Date(w.date) >= sevenDaysAgo);
        }
        // 'all' shows everything
        
        return filtered;
    }
    
    // Calculate summary stats
    function updateSummary() {
        const filtered = filterWorkouts();
        const totalMins = filtered.reduce((sum, w) => sum + (parseInt(w.duration) || 0), 0);
        const totalCals = filtered.reduce((sum, w) => sum + (parseInt(w.calories) || 0), 0);
        
        let timeStr = '';
        if (totalMins >= 60) {
            const hours = Math.floor(totalMins / 60);
            const mins = totalMins % 60;
            timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        } else {
            timeStr = `${totalMins}m`;
        }
        
        totalTimeEl.textContent = timeStr;
        totalCaloriesEl.textContent = totalCals;
        totalWorkoutsEl.textContent = filtered.length;
    }
    
    // Render workout history
    function renderWorkouts() {
        const filtered = filterWorkouts();
        const grouped = groupWorkoutsByDate(filtered);
        const sortedDates = Object.keys(grouped).sort().reverse();
        
        if (sortedDates.length === 0) {
            workoutContainer.innerHTML = `
                <div class="card no-workouts">
                    <span class="material-icons">fitness_center</span>
                    <p>No workouts found</p>
                    <small>Click "Add New Workout" to start tracking your progress!</small>
                </div>
            `;
            updateSummary();
            return;
        }
        
        let html = '';
        sortedDates.forEach(date => {
            const dateWorkouts = grouped[date];
            const totalDateMins = dateWorkouts.reduce((sum, w) => sum + (parseInt(w.duration) || 0), 0);
            const totalDateCals = dateWorkouts.reduce((sum, w) => sum + (parseInt(w.calories) || 0), 0);
            
            html += `
                <div class="workout-history">
                    <div class="workout-date-header">
                        <h4>${formatDate(date)}</h4>
                        <span>🏋️ ${dateWorkouts.length} workouts | 🔥 ${totalDateCals} cal | ⏱️ ${totalDateMins} min</span>
                    </div>
                    <div class="workout-list">
            `;
            
            dateWorkouts.forEach(workout => {
                const repsDisplay = workout.reps || '-';
                html += `
                    <div class="workout-item">
                        <span class="material-icons">fitness_center</span>
                        <div class="workout-info">
                            <strong>${escapeHtml(workout.equipment)}</strong>
                            <div class="workout-meta">
                                <span><span class="material-icons">fitness_center</span> ${workout.sets} sets</span>
                                <span><span class="material-icons">repeat</span> ${repsDisplay} reps</span>
                                <span><span class="material-icons">timer</span> ${workout.duration} min</span>
                                <span><span class="material-icons">local_fire_department</span> ${workout.calories} cal</span>
                            </div>
                            ${workout.notes ? `<div class="workout-meta" style="color:#6c757d; margin-top:0.2rem;">📝 ${escapeHtml(workout.notes)}</div>` : ''}
                        </div>
                        <div class="workout-actions">
                            <button class="edit-workout" data-id="${workout.id}">
                                <span class="material-icons">edit</span>
                            </button>
                            <button class="delete-workout" data-id="${workout.id}">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        workoutContainer.innerHTML = html;
        updateSummary();
        
        // Add event listeners to edit/delete buttons
        document.querySelectorAll('.edit-workout').forEach(btn => {
            btn.addEventListener('click', () => editWorkout(btn.dataset.id));
        });
        document.querySelectorAll('.delete-workout').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
        });
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Add or update workout
    function saveWorkout(e) {
        e.preventDefault();
        
        const id = workoutId.value;
        const newWorkout = {
            equipment: equipmentName.value.trim(),
            sets: parseInt(sets.value),
            reps: reps.value.trim(),
            duration: parseInt(duration.value),
            calories: parseInt(calories.value),
            date: workoutDate.value,
            notes: notes.value.trim(),
            timestamp: new Date().getTime()
        };
        
        if (id) {
            // Update existing
            const index = workouts.findIndex(w => w.id === id);
            if (index !== -1) {
                workouts[index] = { ...newWorkout, id: id };
            }
        } else {
            // Add new
            newWorkout.id = Date.now().toString();
            workouts.push(newWorkout);
        }
        
        saveWorkouts();
        renderWorkouts();
        closeModal();
    }
    
    // Edit workout
    function editWorkout(id) {
        const workout = workouts.find(w => w.id === id);
        if (workout) {
            modalTitle.textContent = 'Edit Workout';
            workoutId.value = workout.id;
            equipmentName.value = workout.equipment;
            sets.value = workout.sets;
            reps.value = workout.reps;
            duration.value = workout.duration;
            calories.value = workout.calories;
            workoutDate.value = workout.date;
            notes.value = workout.notes || '';
            modal.style.display = 'flex';
        }
    }
    
    // Open delete confirmation modal
    function openDeleteModal(id) {
        currentDeleteId = id;
        deleteModal.style.display = 'flex';
    }
    
    // Delete workout
    function deleteWorkout() {
        if (currentDeleteId) {
            workouts = workouts.filter(w => w.id !== currentDeleteId);
            saveWorkouts();
            renderWorkouts();
            closeDeleteModal();
        }
    }
    
    // Close modals
    function closeModal() {
        modal.style.display = 'none';
        workoutForm.reset();
        workoutId.value = '';
        modalTitle.textContent = 'Add Workout';
        workoutDate.value = new Date().toISOString().split('T')[0];
    }
    
    function closeDeleteModal() {
        deleteModal.style.display = 'none';
        currentDeleteId = null;
    }
    
    // Date filter buttons
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.days;
            renderWorkouts();
        });
    });
    
    // Event listeners
    addWorkoutBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Add Workout';
        workoutForm.reset();
        workoutId.value = '';
        workoutDate.value = new Date().toISOString().split('T')[0];
        modal.style.display = 'flex';
    });
    
    workoutForm.addEventListener('submit', saveWorkout);
    cancelBtn.addEventListener('click', closeModal);
    confirmDeleteBtn.addEventListener('click', deleteWorkout);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    
    // Close modal when clicking X
    document.querySelectorAll('.modal-close').forEach(close => {
        close.addEventListener('click', () => {
            closeModal();
            closeDeleteModal();
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
        if (e.target === deleteModal) closeDeleteModal();
    });
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
    }
    
    document.addEventListener('click', function(event) {
        if (sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(event.target) && event.target !== sidebarToggle) {
                sidebar.classList.remove('open');
            }
        }
    });
    
    // Initial render
    renderWorkouts();
});