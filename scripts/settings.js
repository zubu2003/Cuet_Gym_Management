// Settings page JS
document.addEventListener('DOMContentLoaded', function() {
    // Get current user data
    let userData = JSON.parse(localStorage.getItem('user_data')) || {
        name: 'Sazid Ahmed',
        email: 'sazid@cuet.ac.bd',
        studentId: '2021XXXX',
        department: 'CSE',
        phone: ''
    };
    
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
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            
            switch(action) {
                case 'change-password':
                    openModal(passwordModal);
                    break;
                case 'edit-profile':
                    loadProfileData();
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
                    if (confirm('Are you sure you want to logout?')) {
                        window.location.href = 'login.html';
                    }
                    break;
            }
        });
    });
    
    // Load profile data into edit form
    function loadProfileData() {
        document.getElementById('fullName').value = userData.name;
        document.getElementById('profileEmail').value = userData.email;
        document.getElementById('studentId').value = userData.studentId;
        document.getElementById('department').value = userData.department;
        document.getElementById('phone').value = userData.phone || '';
    }
    
    // Change Password Form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentPwd = document.getElementById('currentPassword').value;
            const newPwd = document.getElementById('newPassword').value;
            const confirmPwd = document.getElementById('confirmPassword').value;
            
            if (newPwd !== confirmPwd) {
                alert('New passwords do not match!');
                return;
            }
            
            if (newPwd.length < 4) {
                alert('Password must be at least 4 characters long');
                return;
            }
            
            alert('Password changed successfully!');
            passwordForm.reset();
            closeAllModals();
        });
    }
    
    // Edit Profile Form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            userData = {
                name: document.getElementById('fullName').value,
                email: document.getElementById('profileEmail').value,
                studentId: document.getElementById('studentId').value,
                department: document.getElementById('department').value,
                phone: document.getElementById('phone').value
            };
            
            localStorage.setItem('user_data', JSON.stringify(userData));
            
            // Update profile display
            const profileInfo = document.querySelector('.profile-info');
            if (profileInfo) {
                profileInfo.innerHTML = `
                    <strong>${userData.name}</strong><br>
                    Student ID: ${userData.studentId}<br>
                    Department: ${userData.department}<br>
                    Email: ${userData.email}
                `;
            }
            
            alert('Profile updated successfully!');
            closeAllModals();
        });
    }
    
    // Save Notification Preferences
    const saveNotifications = document.getElementById('saveNotifications');
    if (saveNotifications) {
        saveNotifications.addEventListener('click', function() {
            const preferences = {
                workoutReminders: document.getElementById('workoutReminders').checked,
                gymStatusUpdates: document.getElementById('gymStatusUpdates').checked,
                promotions: document.getElementById('promotions').checked,
                emailNotifications: document.getElementById('emailNotifications').checked
            };
            localStorage.setItem('notification_prefs', JSON.stringify(preferences));
            alert('Notification preferences saved!');
            closeAllModals();
        });
    }
    
    // Save Privacy Settings
    const savePrivacy = document.getElementById('savePrivacy');
    if (savePrivacy) {
        savePrivacy.addEventListener('click', function() {
            const privacy = {
                shareData: document.getElementById('shareData').checked,
                showName: document.getElementById('showName').checked,
                contactEmail: document.getElementById('contactEmail').checked
            };
            localStorage.setItem('privacy_settings', JSON.stringify(privacy));
            alert('Privacy settings saved!');
            closeAllModals();
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
            loadProfileData();
            openModal(profileModal);
        });
    }
    
    // Sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(event.target) && event.target !== sidebarToggle) {
                sidebar.classList.remove('open');
            }
        }
    });
    
    // Load saved preferences
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
});