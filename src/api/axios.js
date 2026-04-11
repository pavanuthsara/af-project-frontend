import axios from 'axios';

const BASE_URL = '/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('eco-auth');
    if (stored) {
      // Zustand persist wraps state as { state: { user, token }, version }
      const parsed = JSON.parse(stored);
      const token = parsed?.state?.token ?? parsed?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch { }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Clear persisted auth — React Router will pick up the state change
      // and redirect to /login via ProtectedRoute naturally
      localStorage.removeItem('eco-auth');
      // Dispatch a custom event so the store can react without a hard reload
      window.dispatchEvent(new Event('eco-auth-expired'));
    }
    return Promise.reject(err);
  }
);

export default api;

