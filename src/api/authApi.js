import api from './axios';

export const signup = (data) => api.post('/signup', data);
export const login = (data) => api.post('/login', data);
export const adminLogin = (data) => api.post('/admin/login', data);
