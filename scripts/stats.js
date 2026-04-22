// stats.js – User personal stats using backend API
const API_BASE = 'http://localhost:5000/api';

// Get current student ID (temporary – replace after login)
let currentStudentId = localStorage.getItem('studentId') || '2021001';

async function loadUserStats() {
  try {
    // Fetch workout stats from backend
    const response = await fetch(`${API_BASE}/workout/stats/${currentStudentId}`);
    if (!response.ok) throw new Error('Failed to load stats');
    const stats = await response.json();

    // Update summary cards
    const totalTimeElem = document.getElementById('totalTime');
    const totalCaloriesElem = document.getElementById('totalCalories');
    const totalWorkoutsElem = document.getElementById('totalWorkouts');

    if (totalTimeElem) {
      const hours = Math.floor(stats.totalTime / 60);
      const minutes = stats.totalTime % 60;
      totalTimeElem.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
    if (totalCaloriesElem) totalCaloriesElem.textContent = stats.totalCalories || 0;
    if (totalWorkoutsElem) totalWorkoutsElem.textContent = stats.totalWorkouts || 0;

    // Optional: load weekly workout data for chart (if you have a chart)
    await loadWeeklyWorkoutData();
  } catch (err) {
    console.error('Stats error:', err);
    // Fallback to localStorage if backend is not ready
    const fallbackStats = JSON.parse(localStorage.getItem(`workout_stats_${currentStudentId}`)) || {};
    document.getElementById('totalTime').textContent = fallbackStats.totalTime || '0m';
    document.getElementById('totalCalories').textContent = fallbackStats.totalCalories || 0;
    document.getElementById('totalWorkouts').textContent = fallbackStats.totalWorkouts || 0;
  }
}

// Optional: load weekly workout data for a small chart (e.g., using Chart.js)
async function loadWeeklyWorkoutData() {
  try {
    // Fetch all workouts for the user
    const response = await fetch(`${API_BASE}/workout/${currentStudentId}`);
    if (!response.ok) throw new Error();
    const workouts = await response.json();

    // Group by day of week
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    workouts.forEach(w => {
      const date = new Date(w.date);
      let dayIndex = date.getDay(); // 0 = Sunday
      dayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // convert to Mon=0
      if (dayIndex >= 0 && dayIndex < 7) counts[dayIndex]++;
    });

    // If you have a canvas element with id "weeklyChart", update it
    const canvas = document.getElementById('weeklyChart');
    if (canvas && window.Chart) {
      if (window.weeklyChart) window.weeklyChart.destroy();
      const ctx = canvas.getContext('2d');
      window.weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{ label: 'Workouts', data: counts, backgroundColor: '#1e3c72' }]
        },
        options: { responsive: true, maintainAspectRatio: true }
      });
    } else {
      // Fallback: display simple list
      const container = document.getElementById('weeklyStatsContainer');
      if (container) {
        container.innerHTML = days.map((day, i) => `<div>${day}: ${counts[i]} workouts</div>`).join('');
      }
    }
  } catch (err) {
    console.warn('Weekly chart data not available');
  }
}

// Load stats on page load
document.addEventListener('DOMContentLoaded', loadUserStats);