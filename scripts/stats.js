// Stats page JS
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

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(event.target) && event.target !== sidebarToggle) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Period buttons functionality
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            periodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            //  logic to load different data based on period
            const period = this.textContent;
            console.log(`Loading data for: ${period}`);
            
            // Show loading effect
            const summaryNumbers = document.querySelectorAll('.summary-number');
            summaryNumbers.forEach(num => {
                num.style.opacity = '0.5';
                setTimeout(() => {
                    num.style.opacity = '1';
                }, 300);
            });
        });
    });
});