// Logs JavaScript
let allLogs = [];

function loadLogs() {
    allLogs = JSON.parse(localStorage.getItem('admin_logs')) || [];
    filterLogs();
}

function filterLogs() {
    const search = document.getElementById('searchLogs').value.toLowerCase();
    const date = document.getElementById('dateFilter').value;
    const type = document.getElementById('typeFilter').value;
    
    let filtered = allLogs.filter(l => 
        (l.studentName.toLowerCase().includes(search) || l.studentId.toLowerCase().includes(search)) &&
        (!date || l.date === date) &&
        (type === 'all' || l.type === type)
    );
    
    renderLogs(filtered);
}

function renderLogs(logs) {
    const tbody = document.getElementById('logsList');
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No logs found</td></tr>';
        return;
    }
    tbody.innerHTML = logs.slice().reverse().map(l => `
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

function exportLogs() {
    const csv = [['Date', 'Time', 'Student ID', 'Student Name', 'Type', 'Duration']];
    allLogs.forEach(l => {
        csv.push([l.date, l.time, l.studentId, l.studentName, l.type === 'entry' ? 'Check In' : 'Check Out', l.duration || '']);
    });
    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', function() {
    loadLogs();
    setInterval(loadLogs, 10000);
    
    document.getElementById('searchLogs').addEventListener('keyup', filterLogs);
    document.getElementById('dateFilter').addEventListener('change', filterLogs);
    document.getElementById('typeFilter').addEventListener('change', filterLogs);
    document.getElementById('exportBtn').addEventListener('click', exportLogs);
});