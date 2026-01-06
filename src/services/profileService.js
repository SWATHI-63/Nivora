import api from './api';

// Get user profile
export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch profile' };
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData);
    if (response.data.success) {
      // Update user in localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...user, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update profile' };
  }
};

// Update password
export const updatePassword = async (passwordData) => {
  try {
    const response = await api.put('/profile/password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update password' };
  }
};
