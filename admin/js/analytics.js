let currentPeriod = 'week';

function getPeriodDateRange(period) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === 'today') return { start, end };
  if (period === 'week') {
    start.setDate(now.getDate() - 6);
    return { start, end };
  }
  if (period === 'month') {
    start.setMonth(now.getMonth() - 1);
    start.setDate(start.getDate() + 1);
    return { start, end };
  }
  start.setFullYear(2020, 0, 1);
  return { start, end };
}

function parseLogDate(dateStr) {
  if (!dateStr) return new Date('');
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

async function getAnalyticsData() {
  try {
    const [logs, peakHours, dailyAttendance, activeStudents] = await Promise.all([
      apiFetch('/logs'),
      apiFetch('/analytics/peak-hours'),
      apiFetch('/analytics/daily-attendance'),
      apiFetch('/analytics/most-active')
    ]);

    const { start, end } = getPeriodDateRange(currentPeriod);
    const filteredLogs = logs.filter(log => {
      const date = parseLogDate(log.date);
      return date >= start && date <= end;
    });

    const entries = filteredLogs.filter(l => l.type === 'entry');
    const exits = filteredLogs.filter(l => l.type === 'exit' && Number(l.duration) > 0);

    const totalVisits = entries.length;
    const avgDuration = exits.length
      ? Math.round(exits.reduce((sum, l) => sum + Number(l.duration || 0), 0) / exits.length)
      : 0;

    const dayCounts = {};
    entries.forEach(log => {
      dayCounts[log.date] = (dayCounts[log.date] || 0) + 1;
    });
    const busiestDayEntry = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    const busiestDay = busiestDayEntry ? busiestDayEntry[0] : '-';

    const topPeak = peakHours[0];
    const peakHourText = topPeak ? `${String(topPeak.hour).padStart(2, '0')}:00` : '-';

    document.getElementById('totalVisits').textContent = totalVisits;
    document.getElementById('avgDuration').textContent = avgDuration;
    document.getElementById('peakHour').textContent = peakHourText;
    document.getElementById('busiestDay').textContent = busiestDay;

    const peakContainer = document.getElementById('peakHoursList');
    if (peakContainer) {
      if (!peakHours.length) {
        peakContainer.innerHTML = '<div class="peak-hour-card"><div class="hour">No data</div><div class="count">0 entries</div></div>';
      } else {
        peakContainer.innerHTML = peakHours.map(item => `
          <div class="peak-hour-card">
            <div class="hour">${String(item.hour).padStart(2, '0')}:00 - ${String((item.hour + 1) % 24).padStart(2, '0')}:00</div>
            <div class="count">${item.count} entries</div>
          </div>
        `).join('');
      }
    }

    const dailyList = document.getElementById('dailyList');
    if (dailyList) {
      const recent = dailyAttendance.slice(0, 14);
      dailyList.innerHTML = recent.length
        ? recent.map(item => `
          <div class="daily-item">
            <span class="daily-date">📅 ${item.date}</span>
            <span class="daily-count">${item.count} visits</span>
          </div>
        `).join('')
        : '<div class="daily-item"><span class="daily-date">No data</span><span class="daily-count">0 visits</span></div>';
    }

    const activeTable = document.getElementById('activeStudentsList');
    if (activeTable) {
      activeTable.innerHTML = activeStudents.length
        ? activeStudents.map((s, idx) => `
          <tr class="${idx < 3 ? 'rank-' + (idx + 1) : ''}">
            <td>${idx + 1}</td>
            <td>${s.name}</td>
            <td>${s.id}</td>
            <td>${s.visits}</td>
            <td>${s.totalHours.toFixed(1)}h</td>
          </tr>
        `).join('')
        : '<tr><td colspan="5" style="text-align:center">No data yet</td></tr>';
    }

    const equipmentMap = {};
    const workouts = await Promise.all(
      activeStudents.slice(0, 30).map(student =>
        apiFetch(`/workout/${student.id}`).catch(() => [])
      )
    );
    workouts.flat().forEach(w => {
      if (!w.equipment) return;
      equipmentMap[w.equipment] = (equipmentMap[w.equipment] || 0) + 1;
    });
    const topEquipment = Object.entries(equipmentMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const equipList = document.getElementById('equipmentList');
    if (equipList) {
      equipList.innerHTML = topEquipment.length
        ? topEquipment.map(([name, count]) => `
          <div class="equipment-item">
            <div class="equipment-name"><span class="material-icons">fitness_center</span> <span>${name}</span></div>
            <div class="equipment-usage">${count} uses</div>
          </div>
        `).join('')
        : '<div class="equipment-item"><div class="equipment-name"><span class="material-icons">fitness_center</span> <span>No workout data</span></div><div class="equipment-usage">0</div></div>';
    }
  } catch (err) {
    console.error('Analytics load failed:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getAnalyticsData();
  document.getElementById('periodSelect')?.addEventListener('change', (e) => {
    currentPeriod = e.target.value;
    getAnalyticsData();
  });
});