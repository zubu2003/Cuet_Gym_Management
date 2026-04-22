// Equipment Management - Complete with Modal
let equipment = [];

// ========== MODAL FUNCTIONS ==========

function openAddEquipmentModal() {
    document.getElementById('modalTitle').textContent = 'Add New Equipment';
    document.getElementById('equipmentForm').reset();
    document.getElementById('equipId').value = '';
    document.getElementById('equipStatus').value = 'active';
    document.getElementById('equipmentModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('equipmentModal').style.display = 'none';
}

async function editEquipment(id) {
    const equip = equipment.find(e => e._id === id);
    if (equip) {
        document.getElementById('modalTitle').textContent = 'Edit Equipment';
        document.getElementById('equipId').value = equip._id;
        document.getElementById('equipName').value = equip.name;
        document.getElementById('equipCategory').value = equip.category;
        document.getElementById('equipTutorial').value = equip.tutorial || '';
        document.getElementById('equipInstructions').value = equip.instructions || '';
        document.getElementById('equipStatus').value = equip.status;
        document.getElementById('equipmentModal').style.display = 'flex';
    }
}

async function deleteEquipment(id) {
    if (!confirm('Are you sure you want to delete this equipment?\n\nThis will also remove it from the user tutorial page.')) return;
    try {
        await apiFetch(`/equipment/${id}`, { method: 'DELETE' });
        alert('Equipment deleted successfully');
        loadEquipment();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// ========== EXPOSE GLOBALS IMMEDIATELY (not inside DOMContentLoaded) ==========
window.openAddEquipmentModal = openAddEquipmentModal;
window.editEquipment = editEquipment;
window.deleteEquipment = deleteEquipment;
window.closeModal = closeModal;

// ========== HELPERS ==========

function getCategoryIcon(category) {
    const icons = {
        'Cardio': 'directions_run',
        'Strength': 'fitness_center',
        'Free Weights': 'fitness_center',
        'Cable': 'cable'
    };
    return icons[category] || 'fitness_center';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

// ========== STATS & RENDER ==========

function updateStats() {
    const total = equipment.length;
    const active = equipment.filter(e => e.status === 'active').length;
    const maintenance = equipment.filter(e => e.status === 'maintenance').length;

    const totalEl = document.getElementById('totalEquipment');
    const activeEl = document.getElementById('activeEquipment');
    const maintenanceEl = document.getElementById('maintenanceEquipment');

    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (maintenanceEl) maintenanceEl.textContent = maintenance;
}

function filterEquipment() {
    const search = document.getElementById('searchEquipment')?.value.toLowerCase() || '';
    const status = document.getElementById('equipStatusFilter')?.value || 'all';

    let filtered = equipment.filter(e => e.name.toLowerCase().includes(search));
    if (status !== 'all') {
        filtered = filtered.filter(e => e.status === status);
    }
    renderEquipment(filtered);
}

function renderEquipment(list) {
    const grid = document.getElementById('equipmentGrid');
    if (!grid) return;

    if (list.length === 0) {
        grid.innerHTML = `
            <div class="empty-equipment">
                <span class="material-icons">fitness_center</span>
                <p>No equipment found</p>
                <button class="add-equipment-btn" onclick="openAddEquipmentModal()">Add Your First Equipment</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = list.map(e => `
        <div class="equipment-card">
            <div class="equipment-card-header">
                <div class="equipment-title">
                    <span class="material-icons">${getCategoryIcon(e.category)}</span>
                    <h3>${escapeHtml(e.name)}</h3>
                </div>
                <span class="status-badge ${e.status === 'active' ? 'active' : 'maintenance'}">
                    ${e.status === 'active' ? '● Active' : '⚠ Maintenance'}
                </span>
            </div>
            <div class="equipment-card-body">
                <div class="equipment-category">
                    <span class="material-icons">category</span>
                    <span>${escapeHtml(e.category)}</span>
                </div>
                ${e.instructions ? `
                    <div class="equipment-instructions">
                        <span class="material-icons">description</span>
                        ${escapeHtml(e.instructions.substring(0, 100))}${e.instructions.length > 100 ? '...' : ''}
                    </div>
                ` : ''}
                ${e.tutorial ? `
                    <a href="${escapeHtml(e.tutorial)}" target="_blank" class="equipment-tutorial">
                        <span class="material-icons">play_circle</span> Watch Tutorial Video
                    </a>
                ` : ''}
            </div>
            <div class="equipment-card-footer">
                <button class="action-icon edit" onclick="editEquipment('${e._id}')" title="Edit">
                    <span class="material-icons">edit</span>
                </button>
                <button class="action-icon delete" onclick="deleteEquipment('${e._id}')" title="Delete">
                    <span class="material-icons">delete_outline</span>
                </button>
            </div>
        </div>
    `).join('');
}

// ========== API CALLS ==========

async function loadEquipment() {
    if (!checkAuth()) return;

    try {
        equipment = await apiFetch('/equipment');
        updateStats();
        filterEquipment();
    } catch (err) {
        console.error('Load equipment error:', err);
        equipment = [];
        const grid = document.getElementById('equipmentGrid');
        if (grid) {
            grid.innerHTML = '<div class="empty-equipment"><span class="material-icons">error</span><p>Failed to load equipment. Make sure backend is running.</p></div>';
        }
    }
}

async function saveEquipment() {
    const id = document.getElementById('equipId').value;
    const equipmentData = {
        name: document.getElementById('equipName').value.trim(),
        category: document.getElementById('equipCategory').value,
        tutorial: document.getElementById('equipTutorial').value.trim(),
        instructions: document.getElementById('equipInstructions').value.trim(),
        status: document.getElementById('equipStatus').value
    };

    if (!equipmentData.name) {
        alert('Please enter equipment name');
        return;
    }
    if (!equipmentData.category) {
        alert('Please select a category');
        return;
    }

    const saveBtn = document.getElementById('saveEquipmentBtn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
    }

    try {
        if (id) {
            await apiFetch(`/equipment/${id}`, {
                method: 'PUT',
                body: JSON.stringify(equipmentData)
            });
            alert('Equipment updated successfully!');
        } else {
            await apiFetch('/equipment', {
                method: 'POST',
                body: JSON.stringify(equipmentData)
            });
            alert('Equipment added successfully!');
        }
        closeModal();
        await loadEquipment();
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 Save Equipment';
        }
    }
}

// ========== EVENT LISTENERS ==========

document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    loadEquipment();

    const addBtn = document.getElementById('addEquipmentBtn');
    const saveBtn = document.getElementById('saveEquipmentBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const searchInput = document.getElementById('searchEquipment');
    const statusFilter = document.getElementById('equipStatusFilter');

    if (addBtn) addBtn.addEventListener('click', openAddEquipmentModal);
    if (saveBtn) saveBtn.addEventListener('click', saveEquipment);
    const form = document.getElementById('equipmentForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveEquipment();
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (searchInput) searchInput.addEventListener('keyup', filterEquipment);
    if (statusFilter) statusFilter.addEventListener('change', filterEquipment);

    // Close modal when clicking the dark backdrop
    window.addEventListener('click', function (e) {
        const modal = document.getElementById('equipmentModal');
        if (e.target === modal) {
            closeModal();
        }
    });
});