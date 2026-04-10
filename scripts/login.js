// Get the form element
const loginForm = document.getElementById('loginForm');

// Add submit event listener
loginForm.addEventListener('submit', function(event) {
    // Prevent page refresh
    event.preventDefault();
    
    // Get input values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (email === '' || password === '') {
        alert('Please fill in both email and password fields.');
        return;
    }
    
    // Check if email contains @ symbol (basic validation)
    if (!email.includes('@')) {
        alert('Please enter a valid email address with @ symbol.');
        return;
    }
    
    // Check minimum password length
    if (password.length < 4) {
        alert('Password must be at least 4 characters long.');
        return;
    }
    
    // If all validation passes, redirect to dashboard.html
    window.location.href = 'dashboard.html';
});

// Add click handlers for forgot password and sign up links
const forgotLink = document.querySelector('.forgot-link');
const signupLink = document.getElementById('signupRedirectLink');

if (forgotLink) {
    forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Password reset link will be sent to your email.');
    });
}

if (signupLink) {
    signupLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'signup.html';  // Change this to your signup page filename
    });
}