// main.js – Homepage (index.html)
document.addEventListener('DOMContentLoaded', function() {
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : '/api';
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

  // Smooth scroll for navigation links (if any)
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        e.preventDefault();
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Optional: Fetch and display live gym status (capacity)
  async function fetchGymStatus() {
    try {
      const response = await fetch(`${API_BASE}/logs/active`);
      const activeUsers = await response.json();
      const capacityElem = document.querySelector('.gym-capacity');
      if (capacityElem) {
        capacityElem.textContent = `${activeUsers.length} / 40`;
      }
    } catch (err) {
      console.warn('Gym status not available');
    }
  }
  // Uncomment if you have an element with class "gym-capacity"
  // fetchGymStatus();
});