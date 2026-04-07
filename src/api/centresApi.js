import api from './axios';

export const getCentres = () => api.get('/recycling-centers');
export const getCentreById = (id) => api.get(`/recycling-centers/${id}`);
export const getCentresByWasteType = (wasteType) => api.get(`/recycling-centers/by-waste/${encodeURIComponent(wasteType)}`);
export const searchCentres = (query) => api.post('/recycling-centers/search', { query });

// Admin
export const createCentre = (data) => api.post('/admin/recycling-centers', data);
export const deleteCentre = (id) => api.delete(`/admin/recycling-centers/${id}`);

// Manager
export const updateCentre = (id, data) => api.put(`/manager/recycling-centers/${id}`, data);