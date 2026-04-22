// Dashboard JS – uses backend API
let currentWeekOffset = 0;

async function refreshData() {
  await loadDashboardStats();
  await loadWeeklyData();
  await loadActiveUsers();
  await loadMostActiveUsers();
  await loadRecentActivity();
}

async function loadDashboardStats() {
  try {
    const stats = await apiFetch('/analytics/dashboard');
    document.getElementById('totalStudents').textContent = stats.totalStudents || 0;
    document.getElementById('todayEntries').textContent = stats.todayEntries || 0;
    document.getElementById('currentlyInside').textContent = stats.currentlyInside || 0;
    document.getElementById('avgDuration').textContent = stats.avgDuration || 0;
  } catch (err) {
    console.error('Dashboard stats error:', err);
  }
}

async function loadWeeklyData() {
  try {
    const { days, counts } = await apiFetch('/analytics/weekly');
    const weeklyList = document.getElementById('weeklyList');
    if (!weeklyList) return;
    let html = '';
    for (let i = 0; i < days.length; i++) {
      html += `
        <div class="weekly-item">
          <div class="weekly-day"><span class="material-icons">calendar_today</span> ${days[i]}</div>
          <div class="weekly-count">${counts[i]} entries</div>
        </div>
      `;
    }
    const total = counts.reduce((a, b) => a + b, 0);
    html += `
      <div class="weekly-item" style="background: #e0e7ff;">
        <div class="weekly-day"><strong>Total This Week</strong></div>
        <div class="weekly-total"><strong>${total} total entries</strong></div>
      </div>
    `;
    weeklyList.innerHTML = html;
  } catch (err) {
    console.error('Weekly data error:', err);
  }
}

async function loadActiveUsers() {
  try {
    const active = await apiFetch('/logs/active');
    const tbody = document.getElementById('activeUsersList');
    if (active.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No active users</td></tr>';
    } else {
      tbody.innerHTML = active.map(s => `
        <tr>
          <td>${s.studentId}</td>
          <td>${s.studentName}</td>
          <td>${s.entryTime}</td>
          <td>${Math.floor((Date.now() - s.timestamp) / 60000)} min</td>
          <td><button class="btn-danger btn-small" onclick="forceCheckoutUser('${s.studentId}')">Checkout</button></td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Active users error:', err);
  }
}

async function loadMostActiveUsers() {
  try {
    const users = await apiFetch('/analytics/most-active');
    const tbody = document.getElementById('mostActiveList');
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center">No data yet</td></tr>';
    } else {
      tbody.innerHTML = users.map((u, idx) => `
        <tr class="${idx === 0 ? 'rank-1' : ''}">
          <td>${u.name}</td>
          <td>${u.visits}</td>
          <td>${u.totalHours.toFixed(1)}h</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Most active error:', err);
  }
}

async function loadRecentActivity() {
  try {
    const logs = await apiFetch('/logs');
    const recent = logs.slice(0, 10);
    const tbody = document.getElementById('recentActivity');
    if (!recent.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No recent activity</td></tr>';
    } else {
      tbody.innerHTML = recent.map(l => `
        <tr>
          <td>${l.time}</td>
          <td>${l.studentName}</td>
          <td>${l.type === 'entry' ? 'Check In' : 'Check Out'}</td>
          <td class="${l.type === 'entry' ? 'status-ok' : 'status-warning'}">${l.type === 'entry' ? 'Inside' : 'Left'}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Recent activity error:', err);
  }
}

async function forceCheckoutUser(studentId) {
  if (!confirm('Force checkout this user?')) return;
  try {
    await apiFetch(`/logs/active/${studentId}`, { method: 'DELETE' });
    alert('User checked out');
    refreshData();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function forceCheckoutAll() {
  const active = await apiFetch('/logs/active');
  if (active.length === 0) return alert('No active users');
  if (!confirm(`Force checkout all ${active.length} users?`)) return;
  for (const s of active) {
    await apiFetch(`/logs/active/${s.studentId}`, { method: 'DELETE' });
  }
  alert('All users checked out');
  refreshData();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  refreshData();
  setInterval(refreshData, 30000);
  document.getElementById('refreshBtn')?.addEventListener('click', refreshData);
  document.getElementById('forceCheckoutAllBtn')?.addEventListener('click', forceCheckoutAll);
  window.forceCheckoutUser = forceCheckoutUser;
});