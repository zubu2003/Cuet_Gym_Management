document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Get all values
    const fullname = document.getElementById('fullname').value;
    const dob = document.getElementById('dob').value;
    const contact = document.getElementById('contact').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmpass = document.getElementById('confirmpass').value;
    
    // Validation checks
    if (fullname === '' || dob === '' || contact === '' || email === '' || password === '' || confirmpass === '') {
        alert('Please fill in all fields.');
        return;
    }
    
    // Name validation (at least 2 words)
    if (fullname.trim().split(' ').length < 2) {
        alert('Please enter your full name (first and last name).');
        return;
    }
    
    // Email validation
    if (!email.includes('@') || !email.includes('.')) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Contact number validation (10 digits)
    const contactRegex = /^[0-9]{10,11}$/;
    if (!contactRegex.test(contact)) {
        alert('Please enter a valid contact number (10-11 digits).');
        return;
    }
    
    // Password length validation
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }
    
    // Confirm password match
    if (password !== confirmpass) {
        alert('Passwords do not match. Please try again.');
        return;
    }
    
    // Age validation (must be at least 15 years old)
    if (dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 15) {
            alert('You must be at least 15 years old to register.');
            return;
        }
    }
    
    // If all validations pass
    alert(`Welcome ${fullname}!\nYour account has been created successfully.\nYou can now login with your email: ${email}`);
    
    // Redirect to login page after 1 second
    setTimeout(function() {
        window.location.href = 'loginpage.html';
    }, 1000);
});

// Add input restriction for contact number (numbers only)
document.getElementById('contact').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
});