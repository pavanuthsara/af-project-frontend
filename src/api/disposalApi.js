import api from './axios';

export const createDisposal = (data) => api.post('/disposal', data);
export const getDisposalHistory = (params) => api.get('/disposal/history', { params });
export const updateDisposal = (id, data) => api.put(`/disposal/${id}`, data);
export const deleteDisposal = (id) => api.delete(`/disposal/${id}`);
export const getDisposalStats = () => api.get('/disposal/stats');
export const getWasteStats = () => api.get('/disposal/waste-stats');

