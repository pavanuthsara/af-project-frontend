import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Identify from './pages/Identify';
import WasteLibrary from './pages/WasteLibrary';
import DisposalLog from './pages/DisposalLog';
import Quizzes from './pages/Quizzes';
import QuizPlay from './pages/QuizPlay';
import Certificates from './pages/Certificates';
import RecycleCentres from './pages/RecycleCentres';
import AdminPanel from './pages/AdminPanel';
import useAuthStore from './store/authStore';

function App() {
  const { token } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={token ? <Navigate to="/" replace /> : <Signup />} />

        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/identify" element={<ProtectedRoute><Identify /></ProtectedRoute>} />
        <Route path="/waste" element={<ProtectedRoute><WasteLibrary /></ProtectedRoute>} />
        <Route path="/disposal" element={<ProtectedRoute><DisposalLog /></ProtectedRoute>} />
        <Route path="/quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
        <Route path="/quizzes/:id/play" element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />
        <Route path="/quizzes/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
        <Route path="/centres" element={<ProtectedRoute><RecycleCentres /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
