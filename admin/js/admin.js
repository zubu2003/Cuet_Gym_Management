// Admin Shared Functions – with Authentication Token Support
const API_BASE = 'https://gymmanagementbackend.vercel.app/api';

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