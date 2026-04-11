import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null });
      },
      clearAuth: () => set({ user: null, token: null }),
      isAdmin: () => useAuthStore.getState().user?.role === 'admin',
      isManager: () => {
        const role = useAuthStore.getState().user?.role;
        return role === 'manager' || role === 'admin';
      },
    }),
    { name: 'eco-auth' }
  )
);

// When the axios 401 interceptor fires, clear state without a hard page reload.
// React Router's ProtectedRoute will detect token === null and redirect to /login.
window.addEventListener('eco-auth-expired', () => {
  useAuthStore.getState().clearAuth();
});

export default useAuthStore;
