import api from './api';

// Register user
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login user
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Logout user
export const logoutUser = async () => {
  const response = await api.get('/auth/logout');
  return response.data;
};

// Update user details
export const updateUserDetails = async (userData) => {
  const response = await api.put('/auth/updatedetails', userData);
  return response.data;
};

// Update password
export const updatePassword = async (passwordData) => {
  const response = await api.put('/auth/updatepassword', passwordData);
  return response.data;
};
