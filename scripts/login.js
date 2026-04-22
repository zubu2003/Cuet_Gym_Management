const API_BASE = 'http://localhost:5000/api';

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    
    // Store token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('studentId', data.user.studentId || '');
    localStorage.setItem('studentName', data.user.studentName || '');
    localStorage.setItem('userRole', data.user.role);
    
    // Redirect based on role
    if (data.user.role === 'admin') {
      window.location.href = '../admin/index.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
});