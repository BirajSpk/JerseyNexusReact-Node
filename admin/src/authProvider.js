// Auth provider for JerseyNexus Admin
const API_URL = 'http://localhost:5000/api';

const authProvider = {
  login: async ({ username, password }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    
    if (data.success && data.data.user.role === 'ADMIN') {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return Promise.resolve();
    } else {
      throw new Error('Access denied. Admin privileges required.');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === 'ADMIN') {
        return Promise.resolve();
      }
    }
    
    return Promise.reject();
  },

  getPermissions: () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return Promise.resolve(userData.role);
    }
    return Promise.reject();
  },

  getIdentity: () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return Promise.resolve({
        id: userData.id,
        fullName: userData.name,
        avatar: userData.avatar,
      });
    }
    return Promise.reject();
  },
};

export default authProvider;