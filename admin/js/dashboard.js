let currentWeekOffset = 0;

function getLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekRange(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset + offset * 7);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function buildWeeklyData(logs, range) {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const rows = dayNames.map((day, idx) => {
    const date = new Date(range.start);
    date.setDate(range.start.getDate() + idx);
    const dateKey = getLocalDateString(date);

    const dayLogs = logs.filter(l => l.date === dateKey);
    const entries = dayLogs.filter(l => l.type === 'entry');
    const exits = dayLogs.filter(l => l.type === 'exit');
    const durations = exits.map(l => Number(l.duration || 0)).filter(Boolean);
    const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

    const hourMap = {};
    entries.forEach(e => {
      const hour = Number(e.hour);
      if (!Number.isNaN(hour)) hourMap[hour] = (hourMap[hour] || 0) + 1;
    });
    const peakHourEntry = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0];
    const peakHour = peakHourEntry ? `${String(peakHourEntry[0]).padStart(2, '0')}:00` : '-';

    return {
      day,
      date: dateKey,
      entries: entries.length,
      exits: exits.length,
      avgDuration,
      peakHour
    };
  });

  return rows;
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
    const logs = await apiFetch('/logs');
    const currentRange = getWeekRange(currentWeekOffset);
    const previousRange = getWeekRange(currentWeekOffset - 1);

    const currentRows = buildWeeklyData(logs, currentRange);
    const previousRows = buildWeeklyData(logs, previousRange);

    const tbody = document.getElementById('weeklyTableBody');
    const weekRangeEl = document.getElementById('weekRange');
    if (!tbody || !weekRangeEl) return;

    weekRangeEl.textContent = `${getLocalDateString(currentRange.start)} to ${getLocalDateString(currentRange.end)}`;

    tbody.innerHTML = currentRows.map((row, idx) => {
      const trend = idx === 0 ? '-' : (row.entries >= currentRows[idx - 1].entries ? '↑' : '↓');
      return `
        <tr>
          <td>${row.day}</td>
          <td>${row.date}</td>
          <td>${row.entries}</td>
          <td>${row.exits}</td>
          <td>${row.avgDuration} min</td>
          <td>${row.peakHour}</td>
          <td>${trend}</td>
        </tr>
      `;
    }).join('');

    const totalVisits = currentRows.reduce((sum, r) => sum + r.entries, 0);
    const avgDaily = (totalVisits / 7).toFixed(1);
    const avgDuration = Math.round(currentRows.reduce((sum, r) => sum + r.avgDuration, 0) / 7);
    const busiest = [...currentRows].sort((a, b) => b.entries - a.entries)[0];
    const quietest = [...currentRows].sort((a, b) => a.entries - b.entries)[0];
    const currentStart = getLocalDateString(currentRange.start);
    const currentEnd = getLocalDateString(currentRange.end);
    const uniqueVisitors = new Set(
      logs
        .filter(l => l.date >= currentStart && l.date <= currentEnd)
        .map(l => l.studentId)
    ).size;

    document.getElementById('weeklyTotalVisits').textContent = totalVisits;
    document.getElementById('weeklyAvgDaily').textContent = avgDaily;
    document.getElementById('weeklyAvgDuration').textContent = `${Number.isFinite(avgDuration) ? avgDuration : 0} min`;
    document.getElementById('weeklyBusiestDay').textContent = busiest ? busiest.day : '-';
    document.getElementById('weeklyQuietestDay').textContent = quietest ? quietest.day : '-';
    document.getElementById('weeklyUniqueVisitors').textContent = uniqueVisitors;

    const prevVisits = previousRows.reduce((sum, r) => sum + r.entries, 0);
    const prevAvgDuration = Math.round(previousRows.reduce((sum, r) => sum + r.avgDuration, 0) / 7) || 0;
    const prevStart = getLocalDateString(previousRange.start);
    const prevEnd = getLocalDateString(previousRange.end);
    const prevUnique = new Set(
      logs
        .filter(l => l.date >= prevStart && l.date <= prevEnd)
        .map(l => l.studentId)
    ).size;

    const compare = (current, previous) => {
      if (!previous) return '100%';
      const pct = ((current - previous) / previous) * 100;
      return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
    };

    document.getElementById('compareVisits').textContent = compare(totalVisits, prevVisits);
    document.getElementById('compareDuration').textContent = compare(avgDuration || 0, prevAvgDuration);
    document.getElementById('compareUnique').textContent = compare(uniqueVisitors, prevUnique);
  } catch (err) {
    console.error('Weekly data error:', err);
  }
}

async function loadActiveUsers() {
  try {
    const active = await apiFetch('/logs/active');
    const tbody = document.getElementById('activeUsersList');
    if (!tbody) return;
    if (!active.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No active users</td></tr>';
      return;
    }
    tbody.innerHTML = active.map(s => `
      <tr>
        <td>${s.studentId}</td>
        <td>${s.studentName}</td>
        <td>${s.entryTime}</td>
        <td>${Math.floor((Date.now() - Number(s.timestamp || Date.now())) / 60000)} min</td>
        <td><button class="btn-danger btn-small" onclick="forceCheckoutUser('${s.studentId}')">Checkout</button></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Active users error:', err);
  }
}

async function loadMostActiveUsers() {
  try {
    const logs = await apiFetch('/logs');
    const range = getWeekRange(currentWeekOffset);
    const start = getLocalDateString(range.start);
    const end = getLocalDateString(range.end);
    const weeklyExitLogs = logs.filter(l => l.type === 'exit' && l.date >= start && l.date <= end);

    const userMap = new Map();
    weeklyExitLogs.forEach(log => {
      if (!userMap.has(log.studentId)) {
        userMap.set(log.studentId, { id: log.studentId, name: log.studentName, visits: 0, totalHours: 0 });
      }
      const user = userMap.get(log.studentId);
      user.visits += 1;
      user.totalHours += Number(log.duration || 0) / 60;
    });

    const users = Array.from(userMap.values()).sort((a, b) => b.visits - a.visits);
    const tbody = document.getElementById('mostActiveList');
    if (!tbody) return;
    tbody.innerHTML = users.length
      ? users.slice(0, 10).map((u, idx) => `
        <tr class="${idx === 0 ? 'rank-1' : ''}">
          <td>${idx + 1}</td>
          <td>${u.name}</td>
          <td>${u.id}</td>
          <td>${u.visits}</td>
          <td>${u.totalHours.toFixed(1)}h</td>
        </tr>
      `).join('')
      : '<tr><td colspan="5" style="text-align:center">No data yet</td></tr>';
  } catch (err) {
    console.error('Most active error:', err);
  }
}

async function loadRecentActivity() {
  try {
    const logs = await apiFetch('/logs');
    const recent = logs.slice(0, 10);
    const tbody = document.getElementById('recentActivity');
    if (!tbody) return;
    tbody.innerHTML = recent.length
      ? recent.map(l => `
        <tr>
          <td>${l.time}</td>
          <td>${l.studentName}</td>
          <td>${l.type === 'entry' ? 'Check In' : 'Check Out'}</td>
          <td class="${l.type === 'entry' ? 'status-ok' : 'status-warning'}">${l.type === 'entry' ? 'Inside' : 'Left'}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="4" style="text-align:center">No recent activity</td></tr>';
  } catch (err) {
    console.error('Recent activity error:', err);
  }
}

async function forceCheckoutUser(studentId) {
  if (!confirm('Force checkout this user?')) return;
  try {
    await apiFetch(`/logs/active/${studentId}`, { method: 'DELETE' });
    await refreshData();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function forceCheckoutAll() {
  try {
    const active = await apiFetch('/logs/active');
    if (!active.length) return alert('No active users');
    if (!confirm(`Force checkout all ${active.length} users?`)) return;
    for (const s of active) {
      await apiFetch(`/logs/active/${s.studentId}`, { method: 'DELETE' });
    }
    await refreshData();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function refreshData() {
  await Promise.all([
    loadDashboardStats(),
    loadWeeklyData(),
    loadActiveUsers(),
    loadMostActiveUsers(),
    loadRecentActivity()
  ]);
}

document.addEventListener('DOMContentLoaded', () => {
  refreshData();
  setInterval(refreshData, 30000);
  document.getElementById('refreshBtn')?.addEventListener('click', refreshData);
  document.getElementById('forceCheckoutAllBtn')?.addEventListener('click', forceCheckoutAll);
  document.getElementById('prevWeekBtn')?.addEventListener('click', () => {
    currentWeekOffset -= 1;
    loadWeeklyData();
  });
  document.getElementById('nextWeekBtn')?.addEventListener('click', () => {
    currentWeekOffset += 1;
    loadWeeklyData();
  });
  window.forceCheckoutUser = forceCheckoutUser;
});