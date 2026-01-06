import api from './api';

// Get all tasks
export const getTasks = async () => {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch tasks' };
  }
};

// Get single task
export const getTask = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch task' };
  }
};

// Create new task
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create task' };
  }
};

// Update task
export const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update task' };
  }
};

// Delete task
export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete task' };
  }
};
