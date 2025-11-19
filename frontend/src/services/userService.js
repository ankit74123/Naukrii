import api from './api';

// Get user profile by ID
export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

// Delete user account
export const deleteAccount = async () => {
  const response = await api.delete('/users/profile');
  return response.data;
};

// Add experience
export const addExperience = async (experienceData) => {
  const response = await api.post('/users/profile/experience', experienceData);
  return response.data;
};

// Delete experience
export const deleteExperience = async (expId) => {
  const response = await api.delete(`/users/profile/experience/${expId}`);
  return response.data;
};

// Add education
export const addEducation = async (educationData) => {
  const response = await api.post('/users/profile/education', educationData);
  return response.data;
};

// Delete education
export const deleteEducation = async (eduId) => {
  const response = await api.delete(`/users/profile/education/${eduId}`);
  return response.data;
};

// Upload profile picture
export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  const response = await api.post('/users/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
