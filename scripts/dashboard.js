// Dashboard page JS
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar when clicking outside (mobile)
    document.addEventListener('click', function(event) {
        if (sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(event.target) && event.target !== sidebarToggle) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Sidebar active state
    const sidebarItems = document.querySelectorAll('.sidebar-menu li');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Timer countdown example
    let time = 2723; // 45:23 in seconds
    const timerElement = document.getElementById('time-remaining');
    
    function updateTimer() {
        if (timerElement && time > 0) {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            time--;
        }
    }
    
    if (timerElement) {
        setInterval(updateTimer, 1000);
    }
});