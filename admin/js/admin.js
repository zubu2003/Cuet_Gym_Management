// Admin Shared Functions – with Authentication Token Support
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : '/api';

// Helper function for all API calls (automatically adds token)
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid – redirect to login
      localStorage.clear();
      window.location.href = '../login.html';
      throw new Error('Session expired. Please login again.');
    }
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  
  return response.json();
}

// Logout function
function logout() {
  localStorage.clear();
  window.location.href = '../login.html';
}

// Check if user is logged in (redirect if not)
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../login.html';
    return false;
  }
  return true;
}

// Get current logged-in user info
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Initialize sample data (only if needed – backend will have its own)
async function initSampleData() {
  // Only run if we have a token and students are empty
  try {
    const students = await apiFetch('/students');
    if (students.length === 0) {
      const sampleStudents = [
        { studentId: '2021001', name: 'Sazid Ahmed', department: 'CSE', email: 'sazid@cuet.ac.bd', phone: '01712345678', status: 'active' },
        { studentId: '2021002', name: 'Rakib Hasan', department: 'EEE', email: 'rakib@cuet.ac.bd', phone: '01812345678', status: 'active' },
        { studentId: '2021003', name: 'Tanvir Rahman', department: 'ME', email: 'tanvir@cuet.ac.bd', phone: '01912345678', status: 'active' }
      ];
      for (const s of sampleStudents) {
        await apiFetch('/students', { method: 'POST', body: JSON.stringify(s) });
      }
      console.log('Sample students added');
    }
  } catch (err) {
    console.error('Init sample data error:', err);
  }
}

// Event listener for logout button (if exists)
document.addEventListener('DOMContentLoaded', function() {
  const adminNavbar = document.querySelector('.admin-navbar');
  const sidebar = document.querySelector('.admin-sidebar');

  if (adminNavbar && sidebar) {
    let toggleBtn = document.getElementById('adminSidebarToggle');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.id = 'adminSidebarToggle';
      toggleBtn.className = 'admin-menu-toggle';
      toggleBtn.setAttribute('aria-label', 'Toggle sidebar');
      toggleBtn.innerHTML = '<span class="material-icons">menu</span>';
      adminNavbar.insertBefore(toggleBtn, adminNavbar.firstChild);
    }

    let overlay = document.querySelector('.admin-sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'admin-sidebar-overlay';
      document.body.appendChild(overlay);
    }

    const closeSidebar = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      document.body.classList.remove('admin-sidebar-open');
    };

    toggleBtn.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      overlay.classList.toggle('show', isOpen);
      document.body.classList.toggle('admin-sidebar-open', isOpen);
    });

    overlay.addEventListener('click', closeSidebar);
    sidebar.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeSidebar);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeSidebar();
      }
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // Check authentication on all admin pages
  if (window.location.pathname.includes('/admin/')) {
    checkAuth();
  }
  
  // Initialize sample data (optional – comment out if not needed)
  // initSampleData();
});