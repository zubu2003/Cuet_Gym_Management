// Analytics page – uses backend API (card style)
let currentPeriod = 'week';

async function getAnalyticsData() {
  // We already have dashboard stats and weekly data; for this page we can reuse
  try {
    const stats = await apiFetch('/analytics/dashboard');
    document.getElementById('totalVisits').textContent = stats.todayEntries || 0;
    document.getElementById('avgDuration').textContent = stats.avgDuration || 0;
    // For peak hour and busiest day, we need additional endpoints – for now placeholder
    document.getElementById('peakHour').textContent = '4:00 PM';
    document.getElementById('busiestDay').textContent = 'Wednesday';
  } catch (err) { console.error(err); }

  // Load peak hours distribution (mock for now, can be extended)
  const peakContainer = document.getElementById('peakHoursList');
  if (peakContainer) {
    peakContainer.innerHTML = '<div class="peak-hour-card"><div class="hour">4:00-5:00</div><div class="count">45 entries</div></div><div class="peak-hour-card"><div class="hour">5:00-6:00</div><div class="count">52 entries</div></div>';
  }

  // Load daily attendance (using weekly data)
  const weekly = await apiFetch('/analytics/weekly');
  const dailyList = document.getElementById('dailyList');
  if (dailyList && weekly.days) {
    dailyList.innerHTML = weekly.days.map((day, i) => `
      <div class="daily-item">
        <span class="daily-date">📅 ${day}</span>
        <span class="daily-count">${weekly.counts[i]} visits</span>
      </div>
    `).join('');
  }

  // Most active students table
  const activeStudents = await apiFetch('/analytics/most-active');
  const activeTable = document.getElementById('activeStudentsList');
  if (activeTable) {
    if (!activeStudents.length) {
      activeTable.innerHTML = '<tr><td colspan="5" style="text-align:center">No data yet</td></tr>';
    } else {
      activeTable.innerHTML = activeStudents.map((s, idx) => `
        <tr class="${idx < 3 ? 'rank-' + (idx+1) : ''}">
          <td>${idx+1}</td>
          <td>${s.name}</td>
          <td>${s.id}</td>
          <td>${s.visits}</td>
          <td>${s.totalHours.toFixed(1)}h</td>
        </tr>
      `).join('');
    }
  }

  // Equipment list (requires equipment API – Day 2)
  const equipList = document.getElementById('equipmentList');
  if (equipList) equipList.innerHTML = '<div class="equipment-item"><div class="equipment-name"><span class="material-icons">fitness_center</span> <span>Coming soon (Day 2)</span></div><div class="equipment-usage">-</div></div>';
}

document.addEventListener('DOMContentLoaded', () => {
  getAnalyticsData();
  document.getElementById('periodSelect')?.addEventListener('change', (e) => {
    currentPeriod = e.target.value;
    getAnalyticsData();
  });
});