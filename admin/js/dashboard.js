// Dashboard JavaScript - With Detailed Weekly Analytics
let currentWeekOffset = 0; // 0 = current week, -1 = previous week, etc.

function refreshData() {
    loadDashboardStats();
    loadWeeklyData();
    loadActiveUsers();
    loadMostActiveUsers();
    loadRecentActivity();
}

function getWeekRange(offset) {
    const now = new Date();
    const currentDay = now.getDay();
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday + (offset * 7));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return { start: weekStart, end: weekEnd };
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatDateDisplay(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function loadWeeklyData() {
    const logs = JSON.parse(localStorage.getItem('admin_logs')) || [];
    const { start, end } = getWeekRange(currentWeekOffset);
    
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    
    document.getElementById('weekRange').textContent = `${formatDateDisplay(start)} - ${formatDateDisplay(end)}`;
    
    // Filter logs for this week
    const weekLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= start && logDate <= end;
    });
    
    const entries = weekLogs.filter(l => l.type === 'entry');
    const exits = weekLogs.filter(l => l.type === 'exit' && l.duration);
    
    // Calculate weekly stats
    const totalVisits = entries.length;
    const avgDailyVisits = Math.round(totalVisits / 7);
    const avgDuration = exits.length ? Math.round(exits.reduce((s, e) => s + (e.duration || 0), 0) / exits.length) : 0;
    
    // Get unique visitors
    const uniqueStudents = new Set(entries.map(e => e.studentId));
    const uniqueCount = uniqueStudents.size;
    
    // Find busiest and quietest days
    const dayCounts = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    entries.forEach(entry => {
        const date = new Date(entry.date);
        const dayName = dayNames[date.getDay()];
        if (dayCounts[dayName] !== undefined) dayCounts[dayName]++;
    });
    
    let busiestDay = 'Monday';
    let busiestCount = 0;
    let quietestDay = 'Monday';
    let quietestCount = Infinity;
    
    Object.entries(dayCounts).forEach(([day, count]) => {
        if (count > busiestCount) {
            busiestCount = count;
            busiestDay = day;
        }
        if (count < quietestCount && day !== 'Sunday') {
            quietestCount = count;
            quietestDay = day;
        }
    });
    
    // Update summary boxes
    document.getElementById('weeklyTotalVisits').textContent = totalVisits;
    document.getElementById('weeklyAvgDaily').textContent = avgDailyVisits;
    document.getElementById('weeklyAvgDuration').textContent = `${avgDuration} min`;
    document.getElementById('weeklyBusiestDay').textContent = `${busiestDay} (${busiestCount} visits)`;
    document.getElementById('weeklyQuietestDay').textContent = `${quietestDay} (${quietestCount} visits)`;
    document.getElementById('weeklyUniqueVisitors').textContent = uniqueCount;
    
    // Build daily breakdown table
    const dailyData = [];
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        const dateStr = formatDate(currentDate);
        const dayName = dayNames[currentDate.getDay()];
        const dayShort = dayNamesShort[currentDate.getDay()];
        
        const dayEntries = entries.filter(e => e.date === dateStr);
        const dayExits = exits.filter(e => e.date === dateStr);
        const dayAvgDuration = dayExits.length ? Math.round(dayExits.reduce((s, e) => s + (e.duration || 0), 0) / dayExits.length) : 0;
        
        // Find peak hour for this day
        const hourCounts = new Array(24).fill(0);
        dayEntries.forEach(e => {
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
        
        dailyData.push({
            day: dayName,
            dayShort: dayShort,
            date: dateStr,
            entries: dayEntries.length,
            exits: dayExits.length,
            avgDuration: dayAvgDuration,
            peakHour: peakHour,
            peakCount: maxCount
        });
    }
    
    // Calculate trends by comparing with previous week
    const { start: prevStart, end: prevEnd } = getWeekRange(currentWeekOffset - 1);
    const prevWeekLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= prevStart && logDate <= prevEnd;
    });
    const prevEntries = prevWeekLogs.filter(l => l.type === 'entry');
    const prevExits = prevWeekLogs.filter(l => l.type === 'exit' && l.duration);
    const prevTotalVisits = prevEntries.length;
    const prevAvgDuration = prevExits.length ? Math.round(prevExits.reduce((s, e) => s + (e.duration || 0), 0) / prevExits.length) : 0;
    const prevUnique = new Set(prevEntries.map(e => e.studentId)).size;
    
    // Calculate percentage changes
    const visitChange = prevTotalVisits === 0 ? 100 : Math.round(((totalVisits - prevTotalVisits) / prevTotalVisits) * 100);
    const durationChange = prevAvgDuration === 0 ? 0 : Math.round(((avgDuration - prevAvgDuration) / prevAvgDuration) * 100);
    const uniqueChange = prevUnique === 0 ? 100 : Math.round(((uniqueCount - prevUnique) / prevUnique) * 100);
    
    // Update comparison section
    document.getElementById('compareVisits').textContent = `${visitChange >= 0 ? '+' : ''}${visitChange}%`;
    document.getElementById('compareVisitsTrend').className = `comparison-trend ${visitChange >= 0 ? 'trend-positive' : 'trend-negative'}`;
    document.getElementById('compareVisitsTrend').textContent = visitChange >= 0 ? '↑ Higher than last week' : '↓ Lower than last week';
    
    document.getElementById('compareDuration').textContent = `${durationChange >= 0 ? '+' : ''}${durationChange}%`;
    document.getElementById('compareDurationTrend').className = `comparison-trend ${durationChange >= 0 ? 'trend-positive' : 'trend-negative'}`;
    document.getElementById('compareDurationTrend').textContent = durationChange >= 0 ? '↑ Longer sessions' : '↓ Shorter sessions';
    
    document.getElementById('compareUnique').textContent = `${uniqueChange >= 0 ? '+' : ''}${uniqueChange}%`;
    document.getElementById('compareUniqueTrend').className = `comparison-trend ${uniqueChange >= 0 ? 'trend-positive' : 'trend-negative'}`;
    document.getElementById('compareUniqueTrend').textContent = uniqueChange >= 0 ? '↑ More students' : '↓ Fewer students';
    
    // Render daily breakdown table
    const tableBody = document.getElementById('weeklyTableBody');
    tableBody.innerHTML = dailyData.map(day => {
        // Calculate trend compared to same day last week
        const lastWeekDate = new Date(day.date);
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        const lastWeekStr = formatDate(lastWeekDate);
        const lastWeekEntries = logs.filter(l => l.date === lastWeekStr && l.type === 'entry').length;
        
        let trendIcon = '';
        let trendClass = '';
        if (day.entries > lastWeekEntries) {
            trendIcon = '▲';
            trendClass = 'trend-up';
        } else if (day.entries < lastWeekEntries) {
            trendIcon = '▼';
            trendClass = 'trend-down';
        } else {
            trendIcon = '●';
            trendClass = 'trend-neutral';
        }
        
        return `
            <tr>
                <td><strong>${day.day}</strong></td>
                <td>${day.date}</td>
                <td>${day.entries}</td>
                <td>${day.exits}</td>
                <td>${day.avgDuration > 0 ? day.avgDuration + ' min' : '-'}</td>
                <td>${day.peakCount > 0 ? `${day.peakHour}:00 (${day.peakCount} entries)` : '-'}</td>
                <td class="${trendClass}">${trendIcon} ${lastWeekEntries > 0 ? Math.round(((day.entries - lastWeekEntries) / lastWeekEntries) * 100) : day.entries}%</td>
            </tr>
        `;
    }).join('');
}

async function loadDashboardStats() {
    const students = JSON.parse(localStorage.getItem('admin_students')) || [];
    const logs = JSON.parse(localStorage.getItem('admin_logs')) || [];
    const activeSessions = JSON.parse(localStorage.getItem('admin_active_sessions')) || [];
    
    document.getElementById('totalStudents').textContent = students.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = logs.filter(l => l.date === today && l.type === 'entry');
    document.getElementById('todayEntries').textContent = todayEntries.length;
    
    document.getElementById('currentlyInside').textContent = activeSessions.length;
    
    const completed = logs.filter(l => l.type === 'exit' && l.duration);
    const avgDur = completed.length ? Math.round(completed.reduce((s, l) => s + (l.duration || 0), 0) / completed.length) : 0;
    document.getElementById('avgDuration').textContent = avgDur;
}

async function loadActiveUsers() {
    const activeSessions = JSON.parse(localStorage.getItem('admin_active_sessions')) || [];
    const activeList = document.getElementById('activeUsersList');
    
    if (activeSessions.length === 0) {
        activeList.innerHTML = '<tr><td colspan="5" style="text-align:center">No active users</td></tr>';
    } else {
        activeList.innerHTML = activeSessions.map(s => `
            <tr>
                <td>${s.studentId}</td>
                <td>${s.studentName}</td>
                <td>${s.entryTime}</td>
                <td>${Math.floor((Date.now() - s.timestamp) / 60000)} min</td>
                <td><button class="btn-danger btn-small" onclick="forceCheckoutUser('${s.studentId}')">Checkout</button></td>
            </tr>
        `).join('');
    }
}

async function loadMostActiveUsers() {
    const logs = JSON.parse(localStorage.getItem('admin_logs')) || [];
    const { start, end } = getWeekRange(0);
    
    const weekLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return log.type === 'exit' && log.duration && logDate >= start && logDate <= end;
    });
    
    const userStats = {};
    weekLogs.forEach(log => {
        if (!userStats[log.studentId]) {
            userStats[log.studentId] = { name: log.studentName, id: log.studentId, visits: 0, totalHours: 0 };
        }
        userStats[log.studentId].visits++;
        userStats[log.studentId].totalHours += (log.duration || 0) / 60;
    });
    
    const sorted = Object.values(userStats).sort((a, b) => b.visits - a.visits).slice(0, 10);
    const mostActiveList = document.getElementById('mostActiveList');
    
    if (sorted.length === 0) {
        mostActiveList.innerHTML = '<tr><td colspan="5" style="text-align:center">No data yet</td></tr>';
    } else {
        mostActiveList.innerHTML = sorted.map((s, idx) => `
            <tr class="${idx === 0 ? 'rank-1' : ''}">
                <td>${idx + 1}</td>
                <td>${s.name}</td>
                <td>${s.id}</td>
                <td>${s.visits}</td>
                <td>${s.totalHours.toFixed(1)}h</td>
            </tr>
        `).join('');
    }
}

async function loadRecentActivity() {
    const logs = JSON.parse(localStorage.getItem('admin_logs')) || [];
    const recent = [...logs].reverse().slice(0, 10);
    const recentActivity = document.getElementById('recentActivity');
    
    if (recent.length === 0) {
        recentActivity.innerHTML = '<tr><td colspan="4" style="text-align:center">No recent activity</td></tr>';
    } else {
        recentActivity.innerHTML = recent.map(l => `
            <tr>
                <td>${l.time}</td>
                <td>${l.studentName}</td>
                <td>${l.type === 'entry' ? 'Check In' : 'Check Out'}</td>
                <td class="${l.type === 'entry' ? 'status-ok' : 'status-warning'}">${l.type === 'entry' ? 'Inside' : 'Left'}</td>
            </tr>
        `).join('');
    }
}

function forceCheckoutUser(studentId) {
    let activeSessions = JSON.parse(localStorage.getItem('admin_active_sessions')) || [];
    const session = activeSessions.find(s => s.studentId === studentId);
    if (session) {
        activeSessions = activeSessions.filter(s => s.studentId !== studentId);
        localStorage.setItem('admin_active_sessions', JSON.stringify(activeSessions));
        
        const logs = JSON.parse(localStorage.getItem('admin_logs')) || [];
        logs.push({
            id: Date.now(),
            studentId: session.studentId,
            studentName: session.studentName,
            type: 'exit',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            duration: Math.floor((Date.now() - session.timestamp) / 60000),
            forced: true
        });
        localStorage.setItem('admin_logs', JSON.stringify(logs));
        refreshData();
        alert(`Force checked out ${session.studentName}`);
    }
}

function forceCheckoutAll() {
    const activeSessions = JSON.parse(localStorage.getItem('admin_active_sessions')) || [];
    if (activeSessions.length === 0) {
        alert('No active users to checkout');
        return;
    }
    if (confirm(`Force checkout all ${activeSessions.length} active users?`)) {
        activeSessions.forEach(session => {
            const logs = JSON.parse(localStorage.getItem('admin_logs')) || [];
            logs.push({
                id: Date.now() + Math.random(),
                studentId: session.studentId,
                studentName: session.studentName,
                type: 'exit',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString(),
                duration: Math.floor((Date.now() - session.timestamp) / 60000),
                forced: true
            });
            localStorage.setItem('admin_logs', JSON.stringify(logs));
        });
        localStorage.setItem('admin_active_sessions', JSON.stringify([]));
        refreshData();
        alert('All users checked out');
    }
}

function changeWeek(direction) {
    currentWeekOffset += direction;
    loadWeeklyData();
}

document.addEventListener('DOMContentLoaded', function() {
    refreshData();
    setInterval(refreshData, 30000);
    
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', refreshData);
    
    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    if (prevWeekBtn) prevWeekBtn.addEventListener('click', () => changeWeek(-1));
    if (nextWeekBtn) nextWeekBtn.addEventListener('click', () => changeWeek(1));
    
    const forceCheckoutAllBtn = document.getElementById('forceCheckoutAllBtn');
    if (forceCheckoutAllBtn) forceCheckoutAllBtn.addEventListener('click', forceCheckoutAll);
    
    window.forceCheckoutUser = forceCheckoutUser;
});