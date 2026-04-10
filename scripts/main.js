// Modern Gym Website JS

document.addEventListener('DOMContentLoaded', function() {
    // Redirect to login page when Get Started button is clicked
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }

    // Redirect to login page when Login button is clicked
    const loginNavBtn = document.getElementById('loginNavBtn');
    if (loginNavBtn) {
        loginNavBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }

    // Smooth scroll for navigation links (Features and Contact)
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Active link highlighting based on scroll
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    
    function updateActiveLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href === `#${current}`) {
                item.classList.add('active');
            }
            // Home link active when at top of page
            if (current === '' && (href === 'index.html' || href === '#')) {
                document.querySelector('.nav-links a[href="index.html"]')?.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Run on load
});