// Student Management JavaScript
let students = [];

function loadStudents() {
    students = JSON.parse(localStorage.getItem('admin_students')) || [];
    filterStudents();
}

function filterStudents() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    let filtered = students.filter(s => 
        s.id.toLowerCase().includes(search) || 
        s.name.toLowerCase().includes(search) || 
        s.department.toLowerCase().includes(search)
    );
    if (status !== 'all') {
        filtered = filtered.filter(s => s.status === status);
    }
    renderStudents(filtered);
}

function renderStudents(list) {
    const tbody = document.getElementById('studentsList');
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No students found</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(s => `
        <tr>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.department}</td>
            <td>${s.email}</td>
            <td>${s.phone || '-'}</td>
            <td><span class="${s.status === 'suspended' ? 'status-danger' : 'status-ok'}">${s.status === 'suspended' ? 'Suspended' : 'Active'}</span></td>
            <td>
                <button class="btn-primary btn-small" onclick="viewStudent('${s.id}')">View</button>
                <button class="btn-warning btn-small" onclick="editStudent('${s.id}')">Edit</button>
                ${s.status === 'suspended' ? 
                    `<button class="btn-success btn-small" onclick="toggleSuspend('${s.id}', 'active')">Activate</button>` :
                    `<button class="btn-danger btn-small" onclick="toggleSuspend('${s.id}', 'suspended')">Suspend</button>`
                }
             </td>
        </tr>
    `).join('');
}

function openAddStudentModal() {
    document.getElementById('modalTitle').textContent = 'Add Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('studentModal').style.display = 'flex';
}

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (student) {
        document.getElementById('modalTitle').textContent = 'Edit Student';
        document.getElementById('studentId').value = student.id;
        document.getElementById('stdId').value = student.id;
        document.getElementById('stdName').value = student.name;
        document.getElementById('stdDept').value = student.department;
        document.getElementById('stdEmail').value = student.email;
        document.getElementById('stdPhone').value = student.phone || '';
        document.getElementById('studentModal').style.display = 'flex';
    }
}

function saveStudent() {
    const id = document.getElementById('stdId').value;
    const existing = students.find(s => s.id === id && s.id !== document.getElementById('studentId').value);
    if (existing) {
        alert('Student ID already exists!');
        return;
    }
    
    const student = {
        id: id,
        name: document.getElementById('stdName').value,
        department: document.getElementById('stdDept').value,
        email: document.getElementById('stdEmail').value,
        phone: document.getElementById('stdPhone').value,
        status: 'active',
        registeredAt: new Date().toISOString()
    };
    
    const editId = document.getElementById('studentId').value;
    if (editId) {
        const index = students.findIndex(s => s.id === editId);
        students[index] = { ...student, id: editId };
    } else {
        students.push(student);
    }
    
    localStorage.setItem('admin_students', JSON.stringify(students));
    closeModal();
    loadStudents();
    alert('Student saved successfully!');
}

function viewStudent(id) {
    const student = students.find(s => s.id === id);
    const logs = JSON.parse(localStorage.getItem('admin_logs')) || [];
    const studentLogs = logs.filter(l => l.studentId === id);
    const totalVisits = studentLogs.filter(l => l.type === 'entry').length;
    const totalHours = studentLogs.filter(l => l.type === 'exit' && l.duration).reduce((s, l) => s + (l.duration || 0), 0) / 60;
    
    document.getElementById('viewStudentContent').innerHTML = `
        <div class="stats-grid" style="margin-bottom:1rem">
            <div class="stat-card"><div class="stat-info"><h3>${student.name}</h3><p>${student.id}</p></div></div>
            <div class="stat-card"><div class="stat-info"><h3>${student.department}</h3><p>Department</p></div></div>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-info"><h3>${totalVisits}</h3><p>Total Visits</p></div></div>
            <div class="stat-card"><div class="stat-info"><h3>${totalHours.toFixed(1)}h</h3><p>Total Hours</p></div></div>
        </div>
        <h4>Recent Activity</h4>
        <div class="table-container">
            <table class="data-table">
                <thead><tr><th>Date</th><th>Time</th><th>Action</th><th>Duration</th></tr></thead>
                <tbody>${studentLogs.slice(-5).reverse().map(l => `
                    <tr><td>${l.date}</td><td>${l.time}</td><td>${l.type === 'entry' ? 'Check In' : 'Check Out'}</td><td>${l.duration ? l.duration + ' min' : '-'}</td></tr>
                `).join('')}</tbody>
            </table>
        </div>
    `;
    document.getElementById('viewModal').style.display = 'flex';
}

function toggleSuspend(id, newStatus) {
    const index = students.findIndex(s => s.id === id);
    students[index].status = newStatus;
    localStorage.setItem('admin_students', JSON.stringify(students));
    loadStudents();
    alert(`Student ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
}

function importCSV() {
    alert('CSV import: Create a file with columns: Student ID, Name, Department, Email, Phone');
}

function closeModal() { document.getElementById('studentModal').style.display = 'none'; }
function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }

document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
    
    document.getElementById('addStudentBtn').addEventListener('click', openAddStudentModal);
    document.getElementById('importCSVBtn').addEventListener('click', importCSV);
    document.getElementById('saveStudentBtn').addEventListener('click', saveStudent);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('closeViewModalBtn').addEventListener('click', closeViewModal);
    document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
    document.getElementById('searchInput').addEventListener('keyup', filterStudents);
    document.getElementById('statusFilter').addEventListener('change', filterStudents);
    
    window.viewStudent = viewStudent;
    window.editStudent = editStudent;
    window.toggleSuspend = toggleSuspend;
});