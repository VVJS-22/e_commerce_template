import axios from '../utils/axios';

class AuthService {
  // Register user
  async register(userData) {
    const response = await axios.post('/auth/register', userData);
    // Only store token if returned (whitelisted emails auto-login)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  // Login user
  async login(credentials) {
    const response = await axios.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user
  async getCurrentUser() {
    const response = await axios.get('/auth/me');
    return response.data;
  }

  // Forgot password
  async forgotPassword(email) {
    const response = await axios.post('/auth/forgotpassword', { email });
    return response.data;
  }

  // Reset password
  async resetPassword(token, password) {
    const response = await axios.put(`/auth/resetpassword/${token}`, { password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  // Verify email
  async verifyEmail(token) {
    const response = await axios.get(`/auth/verify-email/${token}`);
    return response.data;
  }

  // Resend verification email
  async resendVerification(email) {
    const response = await axios.post('/auth/resend-verification', { email });
    return response.data;
  }

  // Delete account
  async deleteAccount(password) {
    const response = await axios.delete('/auth/delete-account', { data: { password } });
    return response.data;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Get stored user
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export default new AuthService();
