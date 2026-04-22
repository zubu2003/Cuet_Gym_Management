// Tutorial page – fetches active equipment from backend
const API_BASE = 'http://localhost:5000/api';

async function loadTutorials() {
  try {
    const response = await fetch(`${API_BASE}/equipment/active`);
    const equipment = await response.json();
    renderEquipment(equipment);
  } catch (err) {
    console.error('Load tutorials error:', err);
    document.getElementById('equipmentGrid').innerHTML = '<div class="no-equipment">Failed to load tutorials. Make sure backend is running.</div>';
  }
}

function renderEquipment(list) {
  const grid = document.getElementById('equipmentGrid');
  if (!grid) return;
  if (list.length === 0) {
    grid.innerHTML = '<div class="no-equipment">No equipment tutorials available yet.</div>';
    return;
  }
  grid.innerHTML = list.map(e => `
    <div class="equipment-card">
      <div class="equipment-icon">${getIcon(e.category)}</div>
      <h3>${e.name}</h3>
      <p class="equipment-category">${e.category}</p>
      ${e.status === 'maintenance' ? '<span class="maintenance-badge">Under Maintenance</span>' : ''}
      ${e.tutorial ? `<button class="watch-tutorial-btn" data-url="${e.tutorial}">🎥 Watch Tutorial</button>` : ''}
      ${e.instructions ? `<p class="equipment-instructions">📝 ${e.instructions}</p>` : ''}
    </div>
  `).join('');
  document.querySelectorAll('.watch-tutorial-btn').forEach(btn => {
    btn.addEventListener('click', () => window.open(btn.dataset.url, '_blank'));
  });
}

function getIcon(category) {
  const icons = { 'Cardio': '🏃‍♂️', 'Strength': '💪', 'Free Weights': '🏋️', 'Cable': '🔗' };
  return icons[category] || '🏋️‍♂️';
}

document.addEventListener('DOMContentLoaded', loadTutorials);