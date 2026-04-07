import api from './axios';

// Categories
export const getCategories = (params) => api.get('/categories', { params });
export const getCategoryById = (id) => api.get(`/categories/${id}`);
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Waste Items
export const getItems = (params) => api.get('/items', { params });
export const getItemById = (id) => api.get(`/items/${id}`);
export const createItem = (data) => api.post('/items', data);
export const updateItem = (id, data) => api.put(`/api/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/items/${id}`);
