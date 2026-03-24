// API Base URL
const API_BASE = '/api';

// Utility function to handle API responses
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
}

// Store token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

function getToken() {
    return localStorage.getItem('token');
}

function removeToken() {
    localStorage.removeItem('token');
}

// Show message function
function showMessage(message, type, elementId = 'message') {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
            messageEl.className = 'message';
        }, 3000);
    }
}

// Login form handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await handleResponse(response);
            
            // Store token
            setToken(data.token);
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard after 1 second
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
            
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

// Register form handler
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            await handleResponse(response);
            
            showMessage('Registration successful! Redirecting to login...', 'success');
            
            // Redirect to login after 1.5 seconds
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
            
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

// Dashboard functionality
if (window.location.pathname.includes('dashboard.html')) {
    // Check if user is authenticated
    const token = getToken();
    if (!token) {
        window.location.href = '/login.html';
    }

    // Load session info
    async function loadSessionInfo() {
        try {
            const response = await fetch(`${API_BASE}/session`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Session expired');
            }
            
            const data = await response.json();
            const sessionInfo = document.getElementById('sessionInfo');
            sessionInfo.innerHTML = `
                <strong>User:</strong> ${data.email}<br>
                <strong>Login Time:</strong> ${new Date(data.loginTime).toLocaleString()}
            `;
        } catch (error) {
            console.error('Session error:', error);
            logout();
        }
    }

    // Load friends
    async function loadFriends() {
        try {
            const response = await fetch(`${API_BASE}/friends`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const friends = await handleResponse(response);
            displayFriends(friends);
        } catch (error) {
            showMessage('Error loading friends: ' + error.message, 'error');
        }
    }

    // Display friends in table
    function displayFriends(friends) {
        const tbody = document.getElementById('friendsList');
        
        if (friends.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No friends found. Add your first friend above!</td></tr>';
            return;
        }
        
        tbody.innerHTML = friends.map(friend => `
            <tr>
                <td>${friend.name}</td>
                <td>${friend.age}</td>
                <td>
                    ${friend.hobbies.map(hobby => 
                        `<span class="hobbies-tag">${hobby}</span>`
                    ).join('')}
                </td>
                <td>${friend.contact.email}</td>
                <td>${friend.contact.phone}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editFriend('${friend._id}')">Edit</button>
                        <button class="btn-delete" onclick="deleteFriend('${friend._id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Add/Update friend
    if (document.getElementById('friendForm')) {
        document.getElementById('friendForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const editId = document.getElementById('editId').value;
            const friendData = {
                name: document.getElementById('name').value,
                age: document.getElementById('age').value,
                hobbies: document.getElementById('hobbies').value,
                contactEmail: document.getElementById('contactEmail').value,
                contactPhone: document.getElementById('contactPhone').value
            };
            
            try {
                let url = `${API_BASE}/friends`;
                let method = 'POST';
                
                if (editId) {
                    url = `${API_BASE}/friends/${editId}`;
                    method = 'PUT';
                }
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(friendData)
                });
                
                await handleResponse(response);
                
                showMessage(editId ? 'Friend updated successfully!' : 'Friend added successfully!', 'success');
                resetForm();
                loadFriends();
                
            } catch (error) {
                showMessage('Error saving friend: ' + error.message, 'error');
            }
        });
    }

    // Edit friend
    window.editFriend = async function(id) {
        try {
            const response = await fetch(`${API_BASE}/friends/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const friend = await handleResponse(response);
            
            // Fill form with friend data
            document.getElementById('editId').value = friend._id;
            document.getElementById('name').value = friend.name;
            document.getElementById('age').value = friend.age;
            document.getElementById('hobbies').value = friend.hobbies.join(', ');
            document.getElementById('contactEmail').value = friend.contact.email;
            document.getElementById('contactPhone').value = friend.contact.phone;
            
            document.getElementById('formTitle').textContent = 'Edit Friend';
            document.getElementById('submitBtn').textContent = 'Update Friend';
            
            // Scroll to form
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            showMessage('Error loading friend details: ' + error.message, 'error');
        }
    };

    // Delete friend
    window.deleteFriend = async function(id) {
        if (!confirm('Are you sure you want to delete this friend?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/friends/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            await handleResponse(response);
            
            showMessage('Friend deleted successfully!', 'success');
            loadFriends();
            
        } catch (error) {
            showMessage('Error deleting friend: ' + error.message, 'error');
        }
    };

    // Reset form
    window.resetForm = function() {
        document.getElementById('friendForm').reset();
        document.getElementById('editId').value = '';
        document.getElementById('formTitle').textContent = 'Add New Friend';
        document.getElementById('submitBtn').textContent = 'Add Friend';
    };

    // Logout function
    window.logout = async function() {
        try {
            await fetch(`${API_BASE}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            removeToken();
            window.location.href = '/';
        }
    };

    // Initialize dashboard
    window.onload = function() {
        loadSessionInfo();
        loadFriends();
    };
}

// Check session on all pages
async function checkSession() {
    if (window.location.pathname.includes('dashboard.html')) {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No token');
            }
            
            const response = await fetch(`${API_BASE}/session`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Session expired');
            }
        } catch (error) {
            console.error('Session check failed:', error);
            removeToken();
            if (!window.location.pathname.includes('login.html') && 
                !window.location.pathname.includes('register.html') &&
                !window.location.pathname.includes('index.html') &&
                window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
    }
}

// Run session check on page load
document.addEventListener('DOMContentLoaded', checkSession);