// Shared admin functions
function logout() {
    window.location.href = '../login.html';
}

// Initialize sample data
function initSampleData() {
    // Sample Students
    if (!localStorage.getItem('admin_students')) {
        const sampleStudents = [
            { id: '2021001', name: 'Sazid Ahmed', department: 'CSE', email: 'sazid@cuet.ac.bd', phone: '01712345678', status: 'active', registeredAt: new Date().toISOString() },
            { id: '2021002', name: 'Rakib Hasan', department: 'EEE', email: 'rakib@cuet.ac.bd', phone: '01812345678', status: 'active', registeredAt: new Date().toISOString() },
            { id: '2021003', name: 'Tanvir Rahman', department: 'ME', email: 'tanvir@cuet.ac.bd', phone: '01912345678', status: 'active', registeredAt: new Date().toISOString() }
        ];
        localStorage.setItem('admin_students', JSON.stringify(sampleStudents));
    }
    
    // Sample Equipment
    if (!localStorage.getItem('admin_equipment')) {
        const sampleEquipment = [
            { id: '1', name: 'Treadmill', category: 'Cardio', tutorial: 'https://youtube.com/watch?v=example1', instructions: 'Start slow, maintain proper posture. Increase speed gradually.', status: 'active' },
            { id: '2', name: 'Bench Press', category: 'Strength', tutorial: 'https://youtube.com/watch?v=example2', instructions: 'Always use a spotter for heavy weights. Keep back flat.', status: 'active' },
            { id: '3', name: 'Dumbbells', category: 'Free Weights', tutorial: 'https://youtube.com/watch?v=example3', instructions: 'Start with light weights to master form.', status: 'active' }
        ];
        localStorage.setItem('admin_equipment', JSON.stringify(sampleEquipment));
        localStorage.setItem('user_equipment', JSON.stringify(sampleEquipment.filter(e => e.status === 'active')));
    }
    
    // Sample Logs
    if (!localStorage.getItem('admin_logs')) {
        const today = new Date().toISOString().split('T')[0];
        const sampleLogs = [
            { id: '1', studentId: '2021001', studentName: 'Sazid Ahmed', type: 'entry', date: today, time: '09:30 AM', hour: 9, duration: null },
            { id: '2', studentId: '2021002', studentName: 'Rakib Hasan', type: 'entry', date: today, time: '10:00 AM', hour: 10, duration: null }
        ];
        localStorage.setItem('admin_logs', JSON.stringify(sampleLogs));
        
        const activeSessions = [
            { studentId: '2021001', studentName: 'Sazid Ahmed', entryTime: '09:30 AM', timestamp: Date.now() - 3600000 },
            { studentId: '2021002', studentName: 'Rakib Hasan', entryTime: '10:00 AM', timestamp: Date.now() - 1800000 }
        ];
        localStorage.setItem('admin_active_sessions', JSON.stringify(activeSessions));
    }
}

// Call init on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSampleData);
} else {
    initSampleData();
}

// Logout handler
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});