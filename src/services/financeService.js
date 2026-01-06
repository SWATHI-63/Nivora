import api from './api';

// Get all finance records
export const getFinanceRecords = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `/finance?${params}` : '/finance';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch finance records' };
  }
};

// Get single finance record
export const getFinanceRecord = async (id) => {
  try {
    const response = await api.get(`/finance/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch finance record' };
  }
};

// Create new finance record
export const createFinanceRecord = async (financeData) => {
  try {
    const response = await api.post('/finance', financeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create finance record' };
  }
};

// Update finance record
export const updateFinanceRecord = async (id, financeData) => {
  try {
    const response = await api.put(`/finance/${id}`, financeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update finance record' };
  }
};

// Delete finance record
export const deleteFinanceRecord = async (id) => {
  try {
    const response = await api.delete(`/finance/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete finance record' };
  }
};

// Get finance analytics
export const getFinanceAnalytics = async () => {
  try {
    const response = await api.get('/finance/analytics');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch analytics' };
  }
};
