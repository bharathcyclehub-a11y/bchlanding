import { useAuth } from './contexts/AuthContext';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';

export default function AdminPanel() {
  const { user, loading, isAdmin } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-dark to-dark-light">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated or not admin
  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  // Show dashboard if authenticated and admin
  return <AdminDashboard />;
}
