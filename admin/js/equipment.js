// Equipment Management JavaScript - Modern Version
let equipment = [];

function loadEquipment() {
    equipment = JSON.parse(localStorage.getItem('admin_equipment')) || [];
    updateStats();
    filterEquipment();
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
    const search = document.getElementById('searchEquipment').value.toLowerCase();
    const status = document.getElementById('equipStatusFilter').value;
    let filtered = equipment.filter(e => e.name.toLowerCase().includes(search));
    if (status !== 'all') filtered = filtered.filter(e => e.status === status);
    renderEquipment(filtered);
}

function getCategoryIcon(category) {
    const icons = {
        'Cardio': 'directions_run',
        'Strength': 'fitness_center',
        'Free Weights': 'barbell',
        'Cable': 'cable'
    };
    return icons[category] || 'fitness_center';
}

function renderEquipment(list) {
    const grid = document.getElementById('equipmentGrid');
    if (list.length === 0) {
        grid.innerHTML = `
            <div class="empty-equipment">
                <span class="material-icons">fitness_center</span>
                <p>No equipment found</p>
                <button class="add-equipment-btn" onclick="openAddEquipmentModal()">
                    <span class="material-icons">add</span> Add Your First Equipment
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = list.map(e => `
        <div class="equipment-card">
            <div class="equipment-card-header">
                <div class="equipment-title">
                    <span class="material-icons">${getCategoryIcon(e.category)}</span>
                    <h3>${e.name}</h3>
                </div>
                <span class="status-badge ${e.status === 'active' ? 'active' : 'maintenance'}">
                    ${e.status === 'active' ? '● Active' : '⚠ Maintenance'}
                </span>
            </div>
            <div class="equipment-card-body">
                <div class="equipment-category">
                    <span class="material-icons">category</span>
                    <span>${e.category}</span>
                </div>
                ${e.instructions ? `
                    <div class="equipment-instructions">
                        <span class="material-icons">description</span>
                        ${e.instructions.substring(0, 100)}${e.instructions.length > 100 ? '...' : ''}
                    </div>
                ` : ''}
                ${e.tutorial ? `
                    <a href="${e.tutorial}" target="_blank" class="equipment-tutorial">
                        <span class="material-icons">play_circle</span> Watch Tutorial Video
                    </a>
                ` : ''}
            </div>
            <div class="equipment-card-footer">
                <button class="action-icon edit" onclick="editEquipment('${e.id}')" title="Edit">
                    <span class="material-icons">edit</span>
                </button>
                <button class="action-icon delete" onclick="deleteEquipment('${e.id}')" title="Delete">
                    <span class="material-icons">delete_outline</span>
                </button>
            </div>
        </div>
    `).join('');
}

function openAddEquipmentModal() {
    document.getElementById('equipModalTitle').textContent = 'Add New Equipment';
    document.getElementById('equipmentForm').reset();
    document.getElementById('equipId').value = '';
    document.getElementById('equipmentModal').style.display = 'flex';
}

function editEquipment(id) {
    const equip = equipment.find(e => e.id === id);
    if (equip) {
        document.getElementById('equipModalTitle').textContent = 'Edit Equipment';
        document.getElementById('equipId').value = equip.id;
        document.getElementById('equipName').value = equip.name;
        document.getElementById('equipCategory').value = equip.category;
        document.getElementById('equipTutorial').value = equip.tutorial || '';
        document.getElementById('equipInstructions').value = equip.instructions || '';
        document.getElementById('equipStatus').value = equip.status;
        document.getElementById('equipmentModal').style.display = 'flex';
    }
}

function saveEquipment() {
    const id = document.getElementById('equipId').value;
    const equipmentData = {
        name: document.getElementById('equipName').value,
        category: document.getElementById('equipCategory').value,
        tutorial: document.getElementById('equipTutorial').value,
        instructions: document.getElementById('equipInstructions').value,
        status: document.getElementById('equipStatus').value
    };
    
    if (!equipmentData.name) {
        alert('Please enter equipment name');
        return;
    }
    
    if (id) {
        const index = equipment.findIndex(e => e.id === id);
        equipment[index] = { ...equipmentData, id: id };
    } else {
        equipmentData.id = Date.now().toString();
        equipment.push(equipmentData);
    }
    
    localStorage.setItem('admin_equipment', JSON.stringify(equipment));
    localStorage.setItem('user_equipment', JSON.stringify(equipment.filter(e => e.status === 'active')));
    closeEquipModal();
    loadEquipment();
    alert(id ? 'Equipment updated successfully!' : 'Equipment added successfully!');
}

function deleteEquipment(id) {
    if (confirm('Are you sure you want to delete this equipment?')) {
        equipment = equipment.filter(e => e.id !== id);
        localStorage.setItem('admin_equipment', JSON.stringify(equipment));
        localStorage.setItem('user_equipment', JSON.stringify(equipment.filter(e => e.status === 'active')));
        loadEquipment();
        alert('Equipment deleted successfully');
    }
}

function closeEquipModal() { 
    document.getElementById('equipmentModal').style.display = 'none'; 
}

document.addEventListener('DOMContentLoaded', function() {
    loadEquipment();
    
    document.getElementById('addEquipmentBtn').addEventListener('click', openAddEquipmentModal);
    document.getElementById('saveEquipmentBtn').addEventListener('click', saveEquipment);
    document.getElementById('closeEquipModalBtn').addEventListener('click', closeEquipModal);
    document.getElementById('cancelEquipModalBtn').addEventListener('click', closeEquipModal);
    document.getElementById('searchEquipment').addEventListener('keyup', filterEquipment);
    document.getElementById('equipStatusFilter').addEventListener('change', filterEquipment);
    
    window.editEquipment = editEquipment;
    window.deleteEquipment = deleteEquipment;
    window.openAddEquipmentModal = openAddEquipmentModal;
});