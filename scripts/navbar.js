// Shared navbar behavior for all user pages
(function initSharedNavbar() {
    const API_BASE = 'https://gymmanagementbackend.vercel.app//api';

    function getProfileDisplayName() {
        const rawName =
            localStorage.getItem('studentName') ||
            localStorage.getItem('userName') ||
            localStorage.getItem('name') ||
            'Student';

        return rawName.split(' ')[0] || 'Student';
    }

    function setupProfileName() {
        const profileNameElement = document.getElementById('profileName');
        if (!profileNameElement) return;
        profileNameElement.textContent = getProfileDisplayName();
    }

    function setupProfileDropdown() {
        const profileBtn = document.getElementById('profileBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');
        const logoutBtn = document.getElementById('logoutBtn');

        if (!profileBtn || !dropdownMenu) return;

        profileBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', function () {
            dropdownMenu.classList.remove('show');
        });

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                localStorage.clear();
                window.location.href = 'login.html';
            });
        }
    }

    function setupSidebarToggle() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');

        if (!sidebarToggle || !sidebar) return;

        sidebarToggle.addEventListener('click', function (event) {
            event.stopPropagation();
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', function (event) {
            if (!sidebar.classList.contains('open')) return;

            if (!sidebar.contains(event.target) && event.target !== sidebarToggle) {
                sidebar.classList.remove('open');
            }
        });
    }

    function getSidebarStatusText(percentage) {
        if (percentage < 70) return { text: '✅ Not Crowded', className: 'status-ok' };
        if (percentage < 90) return { text: '⚠️ Getting Crowded', className: 'status-warning' };
        return { text: '🔴 Very Crowded', className: 'status-danger' };
    }

    async function loadSidebarGymStatus() {
        const token = localStorage.getItem('token');
        if (!token) return;

        const countElements = document.querySelectorAll('.gym-status-count');
        const stateElements = document.querySelectorAll('.gym-status-state');
        if (!countElements.length) return;

        try {
            const response = await fetch(`${API_BASE}/logs/active`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                localStorage.clear();
                window.location.href = 'login.html';
                return;
            }

            if (!response.ok) return;

            const activeSessions = await response.json();
            const currentCount = Array.isArray(activeSessions) ? activeSessions.length : 0;
            const maxCapacity = 40;
            const percentage = (currentCount / maxCapacity) * 100;
            const status = getSidebarStatusText(percentage);

            countElements.forEach(el => {
                el.textContent = `${currentCount} / ${maxCapacity}`;
            });

            stateElements.forEach(el => {
                el.textContent = status.text;
                el.className = `gym-status-state ${status.className}`;
            });
        } catch (error) {
            console.error('Failed to load sidebar gym status:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupProfileName();
        setupProfileDropdown();
        setupSidebarToggle();
        loadSidebarGymStatus();
        setInterval(loadSidebarGymStatus, 15000);
    });
})();
