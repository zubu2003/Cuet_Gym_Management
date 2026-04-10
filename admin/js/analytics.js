// Analytics JavaScript - Card & List Style Only
let currentPeriod = 'week';

function getAnalyticsData() {
    const logs = JSON.parse(localStorage.getItem('admin_logs')) || [];
    const entries = logs.filter(l => l.type === 'entry');
    const exits = logs.filter(l => l.type === 'exit' && l.duration);
    
    // Filter by period
    let filteredEntries = [...entries];
    let filteredExits = [...exits];
    const now = new Date();
    
    if (currentPeriod === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        filteredEntries = entries.filter(e => e.date === todayStr);
        filteredExits = exits.filter(e => e.date === todayStr);
    } else if (currentPeriod === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredEntries = entries.filter(e => new Date(e.date) >= weekAgo);
        filteredExits = exits.filter(e => new Date(e.date) >= weekAgo);
    } else if (currentPeriod === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredEntries = entries.filter(e => new Date(e.date) >= monthAgo);
        filteredExits = exits.filter(e => new Date(e.date) >= monthAgo);
    }
    
    // Summary Stats
    const totalVisits = filteredEntries.length;
    const avgDuration = filteredExits.length ? 
        Math.round(filteredExits.reduce((s, e) => s + (e.duration || 0), 0) / filteredExits.length) : 0;
    
    // Peak Hour
    const hourCounts = new Array(24).fill(0);
    filteredEntries.forEach(e => {
        if (e.hour !== undefined) hourCounts[e.hour]++;
    });
    let peakHour = 0;
    let maxCount = 0;
    hourCounts.forEach((count, hour) => {
        if (count > maxCount) {
            maxCount = count;
            peakHour = hour;
        }
    });
    
    // Busiest Day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    filteredEntries.forEach(e => {
        const date = new Date(e.date);
        const day = date.getDay();
        dayCounts[day]++;
    });
    let busiestDay = 'Sunday';
    let maxDayCount = 0;
    dayCounts.forEach((count, idx) => {
        if (count > maxDayCount) {
            maxDayCount = count;
            busiestDay = dayNames[idx];
        }
    });
    
    document.getElementById('totalVisits').textContent = totalVisits;
    document.getElementById('avgDuration').textContent = avgDuration;
    document.getElementById('peakHour').textContent = `${peakHour}:00 - ${peakHour + 1}:00`;
    document.getElementById('busiestDay').textContent = busiestDay;
    
    // Peak Hours List
    const peakHoursGrid = document.getElementById('peakHoursList');
    const peakData = [];
    for (let i = 0; i < 24; i++) {
        if (hourCounts[i] > 0) {
            peakData.push({ hour: i, count: hourCounts[i] });
        }
    }
    peakData.sort((a, b) => b.count - a.count).slice(0, 8);
    
    if (peakData.length === 0) {
        peakHoursGrid.innerHTML = '<div class="no-data">No data available</div>';
    } else {
        peakHoursGrid.innerHTML = peakData.map(p => `
            <div class="peak-hour-card">
                <div class="hour">${p.hour}:00 - ${p.hour + 1}:00</div>
                <div class="count">${p.count} entries</div>
            </div>
        `).join('');
    }
    
    // Daily Attendance List
    const dailyData = {};
    filteredEntries.forEach(e => {
        if (!dailyData[e.date]) dailyData[e.date] = 0;
        dailyData[e.date]++;
    });
    const sortedDays = Object.keys(dailyData).sort().reverse().slice(0, 14);
    const dailyList = document.getElementById('dailyList');
    
    if (sortedDays.length === 0) {
        dailyList.innerHTML = '<div class="no-data">No data available</div>';
    } else {
        dailyList.innerHTML = sortedDays.map(date => `
            <div class="daily-item">
                <span class="daily-date">📅 ${date}</span>
                <span class="daily-count">${dailyData[date]} visits</span>
            </div>
        `).join('');
    }
    
    // Most Active Students
    const studentStats = {};
    filteredExits.forEach(e => {
        if (!studentStats[e.studentId]) {
            studentStats[e.studentId] = { name: e.studentName, id: e.studentId, visits: 0, totalHours: 0 };
        }
        studentStats[e.studentId].visits++;
        studentStats[e.studentId].totalHours += (e.duration || 0) / 60;
    });
    const sortedStudents = Object.values(studentStats).sort((a, b) => b.visits - a.visits).slice(0, 10);
    const activeStudentsList = document.getElementById('activeStudentsList');
    
    if (sortedStudents.length === 0) {
        activeStudentsList.innerHTML = '<tr><td colspan="5" style="text-align:center">No data yet</td></tr>';
    } else {
        activeStudentsList.innerHTML = sortedStudents.map((s, idx) => `
            <tr class="rank-${idx + 1 <= 3 ? idx + 1 : 0}">
                <td>${idx + 1}</td>
                <td>${s.name}</td>
                <td>${s.id}</td>
                <td>${s.visits}</td>
                <td>${s.totalHours.toFixed(1)}h</td>
            </tr>
        `).join('');
    }
    
    // Popular Equipment (from workout logs)
    const workouts = JSON.parse(localStorage.getItem('user_workouts')) || [];
    const equipCount = {};
    workouts.forEach(w => {
        if (!equipCount[w.equipment]) equipCount[w.equipment] = 0;
        equipCount[w.equipment]++;
    });
    const sortedEquip = Object.entries(equipCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const equipmentList = document.getElementById('equipmentList');
    
    if (sortedEquip.length === 0) {
        equipmentList.innerHTML = '<div class="no-data">No equipment usage data yet</div>';
    } else {
        equipmentList.innerHTML = sortedEquip.map(([name, count]) => `
            <div class="equipment-item">
                <div class="equipment-name">
                    <span class="material-icons">fitness_center</span>
                    <span>${name}</span>
                </div>
                <div class="equipment-usage">${count} times</div>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    getAnalyticsData();
    
    document.getElementById('periodSelect').addEventListener('change', function(e) {
        currentPeriod = e.target.value;
        getAnalyticsData();
    });
});