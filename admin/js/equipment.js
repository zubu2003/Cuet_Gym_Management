// Equipment management with backend API
const API_BASE = 'http://localhost:5000/api';
let equipment = [];

async function loadEquipment() {
  try {
    const response = await fetch(`${API_BASE}/equipment`);
    equipment = await response.json();
    updateStats();
    filterEquipment();
  } catch (err) {
    console.error('Load equipment error:', err);
    equipment = [];
    renderEquipment([]);
  }
}

function updateStats() {
  const total = equipment.length;
  const active = equipment.filter(e => e.status === 'active').length;
  const maintenance = equipment.filter(e => e.status === 'maintenance').length;
  document.getElementById('totalEquipment').textContent = total;
  document.getElementById('activeEquipment').textContent = active;
  document.getElementById('maintenanceEquipment').textContent = maintenance;
}

function filterEquipment() {
  const search = document.getElementById('searchEquipment')?.value.toLowerCase() || '';
  const status = document.getElementById('equipStatusFilter')?.value || 'all';
  let filtered = equipment.filter(e => e.name.toLowerCase().includes(search));
  if (status !== 'all') filtered = filtered.filter(e => e.status === status);
  renderEquipment(filtered);
}

function renderEquipment(list) {
  const grid = document.getElementById('equipmentGrid');
  if (!grid) return;
  if (list.length === 0) {
    grid.innerHTML = '<div class="empty-equipment"><span class="material-icons">fitness_center</span><p>No equipment found</p><button class="add-equipment-btn" onclick="openAddEquipmentModal()">Add Your First Equipment</button></div>';
    return;
  }
  grid.innerHTML = list.map(e => `
    <div class="equipment-card">
      <div class="equipment-card-header">
        <div class="equipment-title"><span class="material-icons">fitness_center</span><h3>${e.name}</h3></div>
        <span class="status-badge ${e.status === 'active' ? 'active' : 'maintenance'}">${e.status === 'active' ? '● Active' : '⚠ Maintenance'}</span>
      </div>
      <div class="equipment-card-body">
        <div class="equipment-category"><span class="material-icons">category</span><span>${e.category}</span></div>
        ${e.instructions ? `<div class="equipment-instructions"><span class="material-icons">description</span>${e.instructions.substring(0, 100)}${e.instructions.length > 100 ? '...' : ''}</div>` : ''}
        ${e.tutorial ? `<a href="${e.tutorial}" target="_blank" class="equipment-tutorial"><span class="material-icons">play_circle</span> Watch Tutorial Video</a>` : ''}
      </div>
      <div class="equipment-card-footer">
        <button class="action-icon edit" onclick="editEquipment('${e._id}')"><span class="material-icons">edit</span></button>
        <button class="action-icon delete" onclick="deleteEquipment('${e._id}')"><span class="material-icons">delete_outline</span></button>
      </div>
    </div>
  `).join('');
}

async function saveEquipment() {
  const id = document.getElementById('equipId').value;
  const equipmentData = {
    name: document.getElementById('equipName').value,
    category: document.getElementById('equipCategory').value,
    tutorial: document.getElementById('equipTutorial').value,
    instructions: document.getElementById('equipInstructions').value,
    status: document.getElementById('equipStatus').value
  };
  if (!equipmentData.name) return alert('Please enter equipment name');
  try {
    if (id) {
      await fetch(`${API_BASE}/equipment/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(equipmentData) });
      alert('Equipment updated');
    } else {
      await fetch(`${API_BASE}/equipment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(equipmentData) });
      alert('Equipment added');
    }
    closeEquipModal();
    loadEquipment();
  } catch (err) { alert('Error: ' + err.message); }
}

async function deleteEquipment(id) {
  if (!confirm('Delete this equipment?')) return;
  try {
    await fetch(`${API_BASE}/equipment/${id}`, { method: 'DELETE' });
    loadEquipment();
    alert('Deleted');
  } catch (err) { alert('Error: ' + err.message); }
}

function openAddEquipmentModal() {
  document.getElementById('equipModalTitle').textContent = 'Add Equipment';
  document.getElementById('equipmentForm').reset();
  document.getElementById('equipId').value = '';
  document.getElementById('equipmentModal').style.display = 'flex';
}

async function editEquipment(id) {
  const equip = equipment.find(e => e._id === id);
  if (equip) {
    document.getElementById('equipModalTitle').textContent = 'Edit Equipment';
    document.getElementById('equipId').value = equip._id;
    document.getElementById('equipName').value = equip.name;
    document.getElementById('equipCategory').value = equip.category;
    document.getElementById('equipTutorial').value = equip.tutorial || '';
    document.getElementById('equipInstructions').value = equip.instructions || '';
    document.getElementById('equipStatus').value = equip.status;
    document.getElementById('equipmentModal').style.display = 'flex';
  }
}

function closeEquipModal() { document.getElementById('equipmentModal').style.display = 'none'; }

document.addEventListener('DOMContentLoaded', () => {
  loadEquipment();
  document.getElementById('addEquipmentBtn')?.addEventListener('click', openAddEquipmentModal);
  document.getElementById('saveEquipmentBtn')?.addEventListener('click', saveEquipment);
  document.getElementById('closeEquipModalBtn')?.addEventListener('click', closeEquipModal);
  document.getElementById('cancelEquipModalBtn')?.addEventListener('click', closeEquipModal);
  document.getElementById('searchEquipment')?.addEventListener('keyup', filterEquipment);
  document.getElementById('equipStatusFilter')?.addEventListener('change', filterEquipment);
  window.editEquipment = editEquipment;
  window.deleteEquipment = deleteEquipment;
  window.openAddEquipmentModal = openAddEquipmentModal;
});