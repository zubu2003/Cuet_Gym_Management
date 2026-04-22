// Students management with backend API
let allStudents = [];

async function loadStudents() {
  try {
    allStudents = await apiFetch('/students');
    filterStudents();
  } catch (err) {
    console.error('Load students error:', err);
    allStudents = [];
    renderStudents([]);
  }
}

function filterStudents() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const status = document.getElementById('statusFilter')?.value || 'all';
  let filtered = allStudents.filter(s =>
    s.studentId.toLowerCase().includes(search) ||
    s.name.toLowerCase().includes(search) ||
    s.department.toLowerCase().includes(search)
  );
  if (status !== 'all') filtered = filtered.filter(s => s.status === status);
  renderStudents(filtered);
}

function renderStudents(students) {
  const tbody = document.getElementById('studentsList');
  if (!tbody) return;
  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No students found</td></tr>';
    return;
  }
  tbody.innerHTML = students.map(s => `
    <tr>
      <td>${s.studentId}</td>
      <td>${s.name}</td>
      <td>${s.department}</td>
      <td>${s.email}</td>
      <td>${s.phone || '-'}</td>
      <td><span class="${s.status === 'suspended' ? 'status-danger' : 'status-ok'}">${s.status === 'suspended' ? 'Suspended' : 'Active'}</span></td>
      <td>
        <button class="btn-primary btn-small" onclick="viewStudent('${s.studentId}')">View</button>
        <button class="btn-warning btn-small" onclick="editStudent('${s.studentId}')">Edit</button>
        ${s.status === 'suspended' ?
          `<button class="btn-success btn-small" onclick="toggleSuspend('${s.studentId}', 'active')">Activate</button>` :
          `<button class="btn-danger btn-small" onclick="toggleSuspend('${s.studentId}', 'suspended')">Suspend</button>`
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

async function editStudent(studentId) {
  const student = allStudents.find(s => s.studentId === studentId);
  if (!student) return;
  document.getElementById('modalTitle').textContent = 'Edit Student';
  document.getElementById('studentId').value = student.studentId;
  document.getElementById('stdId').value = student.studentId;
  document.getElementById('stdName').value = student.name;
  document.getElementById('stdDept').value = student.department;
  document.getElementById('stdEmail').value = student.email;
  document.getElementById('stdPhone').value = student.phone || '';
  document.getElementById('studentModal').style.display = 'flex';
}

async function saveStudent() {
  const id = document.getElementById('stdId').value;
  const studentData = {
    studentId: id,
    name: document.getElementById('stdName').value,
    department: document.getElementById('stdDept').value,
    email: document.getElementById('stdEmail').value,
    phone: document.getElementById('stdPhone').value,
    status: 'active'
  };
  try {
    const existingId = document.getElementById('studentId').value;
    if (existingId) {
      // Update
      await apiFetch(`/students/${existingId}`, { method: 'PUT', body: JSON.stringify(studentData) });
      alert('Student updated');
    } else {
      // Create
      await apiFetch('/students', { method: 'POST', body: JSON.stringify(studentData) });
      alert('Student added');
    }
    closeModal();
    loadStudents();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function viewStudent(studentId) {
  const student = allStudents.find(s => s.studentId === studentId);
  if (!student) return;
  // Fetch workout stats from backend
  let workoutStats = { totalVisits: 0, totalHours: 0 };
  try {
    const stats = await apiFetch(`/workout/stats/${studentId}`);
    workoutStats.totalVisits = stats.totalWorkouts || 0;
    workoutStats.totalHours = (stats.totalTime / 60).toFixed(1);
  } catch (e) { console.warn(e); }
  // Fetch recent logs
  let logs = [];
  try {
    logs = await apiFetch(`/logs?search=${studentId}`);
  } catch (e) { console.warn(e); }
  const content = document.getElementById('viewStudentContent');
  content.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-info"><h3>${student.name}</h3><p>${student.studentId}</p></div></div>
      <div class="stat-card"><div class="stat-info"><h3>${student.department}</h3><p>Department</p></div></div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-info"><h3>${workoutStats.totalVisits}</h3><p>Total Workouts</p></div></div>
      <div class="stat-card"><div class="stat-info"><h3>${workoutStats.totalHours}h</h3><p>Total Hours</p></div></div>
    </div>
    <h4>Recent Activity</h4>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Date</th><th>Time</th><th>Action</th><th>Duration</th></tr></thead>
        <tbody>${logs.slice(0,5).map(l => `<tr><td>${l.date}</td><td>${l.time}</td><td>${l.type === 'entry' ? 'Check In' : 'Check Out'}</td><td>${l.duration ? l.duration + ' min' : '-'}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  `;
  document.getElementById('viewModal').style.display = 'flex';
}

async function toggleSuspend(studentId, newStatus) {
  try {
    await apiFetch(`/students/${studentId}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
    alert(`Student ${newStatus === 'suspended' ? 'suspended' : 'activated'}`);
    loadStudents();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

function closeModal() { document.getElementById('studentModal').style.display = 'none'; }
function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }

async function importStudentsFromCSV(file) {
  const text = await file.text();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    alert('CSV file is empty or invalid');
    return;
  }

  const rows = lines.slice(1); // skip header
  let success = 0;
  let failed = 0;

  for (const row of rows) {
    const parts = row.split(',').map(v => v.trim());
    if (parts.length < 4) {
      failed++;
      continue;
    }

    const [studentId, name, department, email, phone = ''] = parts;
    if (!studentId || !name || !department || !email) {
      failed++;
      continue;
    }

    try {
      await apiFetch('/students', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          name,
          department,
          email,
          phone,
          status: 'active'
        })
      });
      success++;
    } catch (err) {
      failed++;
    }
  }

  alert(`Import complete. Success: ${success}, Failed: ${failed}`);
  loadStudents();
}

function handleImportCSV() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await importStudentsFromCSV(file);
  };
  input.click();
}

document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  document.getElementById('addStudentBtn')?.addEventListener('click', openAddStudentModal);
  document.getElementById('saveStudentBtn')?.addEventListener('click', saveStudent);
  document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('closeViewModalBtn')?.addEventListener('click', closeViewModal);
  document.getElementById('searchInput')?.addEventListener('keyup', filterStudents);
  document.getElementById('statusFilter')?.addEventListener('change', filterStudents);
  document.getElementById('importCSVBtn')?.addEventListener('click', handleImportCSV);
  window.viewStudent = viewStudent;
  window.editStudent = editStudent;
  window.toggleSuspend = toggleSuspend;
});