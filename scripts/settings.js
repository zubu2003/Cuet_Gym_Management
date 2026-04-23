// Settings page JS - Connected to Backend API
const API_BASE = 'http://localhost:5000/api';

// Get current user from localStorage
let token = localStorage.getItem('token');
let currentStudentId = localStorage.getItem('studentId');
let currentStudentName = localStorage.getItem('studentName');

// Check if user is logged in
function checkAuth() {
    if (!token || !currentStudentId) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// API fetch with authentication
async function apiFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        localStorage.clear();
        window.location.href = 'login.html';
        throw new Error('Session expired');
    }
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
    }
    
    return response.json();
}

// Load user profile from database
async function loadUserProfile() {
    if (!checkAuth()) return;
    
    try {
        const student = await apiFetch(`/students/${currentStudentId}`);
        
        const profileInfo = document.querySelector('.profile-info');
        if (profileInfo) {
            profileInfo.innerHTML = `
                <strong>${student.name || currentStudentName}</strong><br>
                Student ID: ${student.studentId || currentStudentId}<br>
                Department: ${student.department || 'Not set'}<br>
                Email: ${student.email || 'Not set'}
            `;
        }
        
        const profileNameSpan = document.getElementById('profileName');
        if (profileNameSpan) {
            profileNameSpan.textContent = student.name?.split(' ')[0] || currentStudentName?.split(' ')[0] || 'Student';
        }
        
        window.userData = {
            name: student.name || currentStudentName,
            email: student.email,
            studentId: student.studentId || currentStudentId,
            department: student.department || 'CSE',
            phone: student.phone || ''
        };
        
    } catch (err) {
        console.error('Error loading profile:', err);
        window.userData = {
            name: currentStudentName || 'Student',
            email: localStorage.getItem('userEmail') || 'student@cuet.ac.bd',
            studentId: currentStudentId,
            department: 'CSE',
            phone: ''
        };
    }
}

// Load gym status
async function loadGymStatus() {
    try {
        const activeSessions = await apiFetch('/logs/active');
        const currentCount = activeSessions.length;
        const maxCapacity = 40;
        
        const statusCountElem = document.querySelector('.gym-status-count');
        const statusStateElem = document.querySelector('.gym-status-state');
        
        if (statusCountElem) {
            statusCountElem.textContent = `${currentCount} / ${maxCapacity}`;
        }
        
        if (statusStateElem) {
            if (currentCount < 30) {
                statusStateElem.innerHTML = '✅ Not Crowded';
                statusStateElem.className = 'gym-status-state status-ok';
            } else {
                statusStateElem.innerHTML = '⚠️ Crowded';
                statusStateElem.className = 'gym-status-state status-warning';
            }
        }
    } catch (err) {
        console.error('Error loading gym status:', err);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Delete Account Function
async function deleteAccount() {
    const password = document.getElementById('deletePassword').value;
    const confirmText = document.getElementById('deleteConfirmText').value;
    
    if (confirmText !== 'DELETE') {
        alert('Please type DELETE to confirm account deletion');
        return;
    }
    
    if (!password) {
        alert('Please enter your password');
        return;
    }
    
    if (!confirm('Are you absolutely sure? This action cannot be undone!')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/students/account/${currentStudentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Delete failed');
        }
        
        alert('Your account has been permanently deleted.');
        localStorage.clear();
        window.location.href = 'login.html';
        
    } catch (err) {
        alert('Delete failed: ' + err.message);
    }
}

// Update Profile
async function updateProfile(profileData) {
    try {
        await apiFetch(`/students/${currentStudentId}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: profileData.name,
                email: profileData.email,
                department: profileData.department,
                phone: profileData.phone
            })
        });
        
        localStorage.setItem('studentName', profileData.name);
        window.userData = profileData;
        
        const profileInfo = document.querySelector('.profile-info');
        if (profileInfo) {
            profileInfo.innerHTML = `
                <strong>${profileData.name}</strong><br>
                Student ID: ${profileData.studentId}<br>
                Department: ${profileData.department}<br>
                Email: ${profileData.email}
            `;
        }
        
        return true;
    } catch (err) {
        alert('Failed to update profile: ' + err.message);
        return false;
    }
}

// Change Password
async function changePassword(currentPassword, newPassword, confirmPassword) {
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return false;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return false;
    }
    
    alert('Password changed successfully!');
    return true;
}

// Save Notification Preferences
function saveNotificationPreferences() {
    const preferences = {
        workoutReminders: document.getElementById('workoutReminders')?.checked || false,
        gymStatusUpdates: document.getElementById('gymStatusUpdates')?.checked || false,
        promotions: document.getElementById('promotions')?.checked || false,
        emailNotifications: document.getElementById('emailNotifications')?.checked || false
    };
    localStorage.setItem('notification_prefs', JSON.stringify(preferences));
    alert('Notification preferences saved!');
}

// Save Privacy Settings
function savePrivacySettings() {
    const privacy = {
        shareData: document.getElementById('shareData')?.checked || false,
        showName: document.getElementById('showName')?.checked || false,
        contactEmail: document.getElementById('contactEmail')?.checked || false
    };
    localStorage.setItem('privacy_settings', JSON.stringify(privacy));
    alert('Privacy settings saved!');
}

// Load profile data into edit form
function loadProfileDataForEdit() {
    const userData = window.userData || {};
    document.getElementById('fullName').value = userData.name || '';
    document.getElementById('profileEmail').value = userData.email || '';
    document.getElementById('studentId').value = userData.studentId || '';
    document.getElementById('department').value = userData.department || 'CSE';
    document.getElementById('phone').value = userData.phone || '';
}

// DOM Elements
const editProfileBtn = document.getElementById('editProfileBtn');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');

// Modals
const passwordModal = document.getElementById('passwordModal');
const profileModal = document.getElementById('profileModal');
const notificationModal = document.getElementById('notificationModal');
const aboutModal = document.getElementById('aboutModal');
const helpModal = document.getElementById('helpModal');
const termsModal = document.getElementById('termsModal');
const privacyModal = document.getElementById('privacyModal');
const deleteAccountModal = document.getElementById('deleteAccountModal');

// Close all modals function
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Open modal
function openModal(modal) {
    closeAllModals();
    if (modal) modal.style.display = 'flex';
}

// Settings item click handlers
document.querySelectorAll('.settings-item').forEach(item => {
    item.addEventListener('click', async function() {
        const action = this.dataset.action;
        
        switch(action) {
            case 'change-password':
                openModal(passwordModal);
                break;
            case 'edit-profile':
                loadProfileDataForEdit();
                openModal(profileModal);
                break;
            case 'notifications':
                openModal(notificationModal);
                break;
            case 'privacy':
                openModal(privacyModal);
                break;
            case 'help':
                openModal(helpModal);
                break;
            case 'about':
                openModal(aboutModal);
                break;
            case 'terms':
                openModal(termsModal);
                break;
            case 'logout':
                logout();
                break;
            case 'delete-account':
                openModal(deleteAccountModal);
                break;
        }
    });
});

// Change Password Form
const passwordForm = document.getElementById('passwordForm');
if (passwordForm) {
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const currentPwd = document.getElementById('currentPassword').value;
        const newPwd = document.getElementById('newPassword').value;
        const confirmPwd = document.getElementById('confirmPassword').value;
        
        const success = await changePassword(currentPwd, newPwd, confirmPwd);
        if (success) {
            passwordForm.reset();
            closeAllModals();
        }
    });
}

// Edit Profile Form
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const profileData = {
            name: document.getElementById('fullName').value,
            email: document.getElementById('profileEmail').value,
            studentId: document.getElementById('studentId').value,
            department: document.getElementById('department').value,
            phone: document.getElementById('phone').value
        };
        
        const success = await updateProfile(profileData);
        if (success) {
            alert('Profile updated successfully!');
            closeAllModals();
        }
    });
}

// Save Notification Preferences
const saveNotifications = document.getElementById('saveNotifications');
if (saveNotifications) {
    saveNotifications.addEventListener('click', function() {
        saveNotificationPreferences();
        closeAllModals();
    });
}

// Save Privacy Settings
const savePrivacy = document.getElementById('savePrivacy');
if (savePrivacy) {
    savePrivacy.addEventListener('click', function() {
        savePrivacySettings();
        closeAllModals();
    });
}

// Delete Account Modal Buttons
const confirmDeleteAccountBtn = document.getElementById('confirmDeleteAccountBtn');
const cancelDeleteAccountBtn = document.getElementById('cancelDeleteAccountBtn');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');

if (confirmDeleteAccountBtn) {
    confirmDeleteAccountBtn.addEventListener('click', deleteAccount);
}

if (cancelDeleteAccountBtn) {
    cancelDeleteAccountBtn.addEventListener('click', () => {
        closeAllModals();
        document.getElementById('deletePassword').value = '';
        document.getElementById('deleteConfirmText').value = '';
    });
}

if (closeDeleteModalBtn) {
    closeDeleteModalBtn.addEventListener('click', () => {
        closeAllModals();
        document.getElementById('deletePassword').value = '';
        document.getElementById('deleteConfirmText').value = '';
    });
}

// Cancel buttons for modals
document.querySelectorAll('.cancel-modal-btn, .modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeAllModals();
    }
});

// Edit profile button
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', function() {
        loadProfileDataForEdit();
        openModal(profileModal);
    });
}

// Profile Dropdown
function setupProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const logoutDropdownBtn = document.getElementById('logoutBtn');
    
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
    }
    
    document.addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
    });
    
    if (logoutDropdownBtn) {
        logoutDropdownBtn.addEventListener('click', logout);
    }
}

// Sidebar toggle
function setupSidebar() {
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
    }
    
    document.addEventListener('click', function(event) {
        if (sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(event.target) && event.target !== sidebarToggle) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// Load saved preferences
function loadSavedPreferences() {
    const savedNotifPrefs = JSON.parse(localStorage.getItem('notification_prefs'));
    if (savedNotifPrefs) {
        if (document.getElementById('workoutReminders')) document.getElementById('workoutReminders').checked = savedNotifPrefs.workoutReminders;
        if (document.getElementById('gymStatusUpdates')) document.getElementById('gymStatusUpdates').checked = savedNotifPrefs.gymStatusUpdates;
        if (document.getElementById('promotions')) document.getElementById('promotions').checked = savedNotifPrefs.promotions;
        if (document.getElementById('emailNotifications')) document.getElementById('emailNotifications').checked = savedNotifPrefs.emailNotifications;
    }
    
    const savedPrivacy = JSON.parse(localStorage.getItem('privacy_settings'));
    if (savedPrivacy) {
        if (document.getElementById('shareData')) document.getElementById('shareData').checked = savedPrivacy.shareData;
        if (document.getElementById('showName')) document.getElementById('showName').checked = savedPrivacy.showName;
        if (document.getElementById('contactEmail')) document.getElementById('contactEmail').checked = savedPrivacy.contactEmail;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    checkAuth();
    await loadUserProfile();
    await loadGymStatus();
    setupProfileDropdown();
    setupSidebar();
    loadSavedPreferences();
});