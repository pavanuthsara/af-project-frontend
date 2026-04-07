import api from './axios';

export const getItems = (params) => api.get('/waste', { params });
