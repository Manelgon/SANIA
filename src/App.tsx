import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './features/auth/AuthContext';
import FacultativoDashboard from './features/facultativo/FacultativoDashboard';
import AdminDashboard from './features/admin/AdminDashboard';

function RootRedirect() {
    const { profile, loading } = useAuth();

    if (loading) return null;
    if (!profile) return <Navigate to="/login" replace />;

    if (profile.role === 'medico') return <Navigate to="/medico" replace />;
    if (profile.role === 'admin') return <AdminDashboard />;

    return <div className="p-10 text-center text-slate-500">Bienvenido al Panel de Paciente (En desarrollo)</div>;
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/medico"
                element={
                    <ProtectedRoute allowedRoles={['medico', 'admin']}>
                        <FacultativoDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <RootRedirect />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;
