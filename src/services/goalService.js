import api from './api';

// Get all goals
export const getGoals = async () => {
  try {
    const response = await api.get('/goals');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch goals' };
  }
};

// Get single goal
export const getGoal = async (id) => {
  try {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch goal' };
  }
};

// Create new goal
export const createGoal = async (goalData) => {
  try {
    const response = await api.post('/goals', goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create goal' };
  }
};

// Update goal
export const updateGoal = async (id, goalData) => {
  try {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update goal' };
  }
};

// Delete goal
export const deleteGoal = async (id) => {
  try {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete goal' };
  }
};
