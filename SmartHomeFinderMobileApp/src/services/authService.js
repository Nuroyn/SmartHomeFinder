import { api } from './api'

export const authService = {
  signup: (payload) => api.post('/api/auth/signup', payload),
  login: (payload) => api.post('/api/auth/login', payload),
  getProfile: () => api.get('/api/auth/profile'),
  updateAvatar: (payload) => api.post('/api/auth/avatar', payload),
  updateProfile: (payload) => api.put('/api/users/profile', payload),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
  getBankAccount: () => api.get('/api/users/bank-account'),
  updateBankAccount: (payload) => api.put('/api/users/bank-account', payload),
}
