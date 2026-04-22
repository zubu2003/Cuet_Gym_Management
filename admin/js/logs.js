// Logs page using backend API
let allLogs = [];

async function loadLogs() {
  try {
    allLogs = await apiFetch('/logs');
    filterLogs();
  } catch (err) {
    console.error('Load logs error:', err);
    allLogs = [];
    renderLogs([]);
  }
}

function filterLogs() {
  const search = document.getElementById('searchLogs')?.value.toLowerCase() || '';
  const date = document.getElementById('dateFilter')?.value || '';
  const type = document.getElementById('typeFilter')?.value || 'all';
  let filtered = allLogs.filter(l =>
    (l.studentName.toLowerCase().includes(search) || l.studentId.toLowerCase().includes(search)) &&
    (!date || l.date === date) &&
    (type === 'all' || l.type === type)
  );
  renderLogs(filtered);
}

function renderLogs(logs) {
  const tbody = document.getElementById('logsList');
  if (!tbody) return;
  if (logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No logs found</td></tr>';
    return;
  }
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td>${l.date}</td>
      <td>${l.time}</td>
      <td>${l.studentId}</td>
      <td>${l.studentName}</td>
      <td class="${l.type === 'entry' ? 'status-ok' : 'status-warning'}">${l.type === 'entry' ? 'Check In' : 'Check Out'}</td>
      <td>${l.duration ? l.duration + ' min' : '-'}</td>
    </tr>
  `).join('');
}

async function exportLogs() {
  try {
    const search = document.getElementById('searchLogs')?.value || '';
    const date = document.getElementById('dateFilter')?.value || '';
    const type = document.getElementById('typeFilter')?.value || 'all';
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (date) params.set('date', date);
    if (type && type !== 'all') params.set('type', type);
    const logs = await apiFetch(`/logs?${params.toString()}`);
    const csvRows = [['Date', 'Time', 'Student ID', 'Student Name', 'Type', 'Duration']];
    logs.forEach(l => {
      csvRows.push([l.date, l.time, l.studentId, l.studentName, l.type === 'entry' ? 'Check In' : 'Check Out', l.duration || '']);
    });
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Export failed: ' + err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadLogs();
  setInterval(loadLogs, 10000);
  document.getElementById('searchLogs')?.addEventListener('keyup', filterLogs);
  document.getElementById('dateFilter')?.addEventListener('change', filterLogs);
  document.getElementById('typeFilter')?.addEventListener('change', filterLogs);
  document.getElementById('exportBtn')?.addEventListener('click', exportLogs);
});