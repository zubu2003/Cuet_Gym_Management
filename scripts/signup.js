// Signup page JS
const API_BASE = 'https://gymmanagementbackend.vercel.app/api';

document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const studentId = document.getElementById('studentId').value.trim();
  const fullname = document.getElementById('fullname').value.trim();
  const department = document.getElementById('department').value;
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validation
  if (!studentId || !fullname || !department || !username || !email || !password) {
    alert('Please fill in all required fields');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  if (!email.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        studentName: fullname,
        department,
        username,
        email,
        phone,
        password
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }
    
    const data = await response.json();
    
    // Store login info
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('studentId', data.user.studentId);
    localStorage.setItem('studentName', data.user.studentName);
    localStorage.setItem('userRole', data.user.role);
    
    alert('Account created successfully!');
    window.location.href = 'dashboard.html';
  } catch (err) {
    alert('Signup failed: ' + err.message);
  }
});