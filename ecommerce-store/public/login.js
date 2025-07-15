document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            // Store auth token and user info
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('isAdmin', data.user.isAdmin || false);
            
            // Show success message
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect based on user role
            setTimeout(() => {
                if (data.user.isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            showMessage(error.message || 'Login failed. Please try again.', 'error');
        }
    });
    
    function showMessage(message, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
});