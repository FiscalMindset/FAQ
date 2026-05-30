import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">FAQ Generator</Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                <Link to="/" className="px-3 py-2 text-gray-700 hover:text-blue-600">Home</Link>
                {user && <Link to="/submit-question" className="px-3 py-2 text-gray-700 hover:text-blue-600">Submit Question</Link>}
                {isAdmin() && (
                  <>
                    <Link to="/admin/questions" className="px-3 py-2 text-gray-700 hover:text-blue-600">Questions</Link>
                    <Link to="/admin/faqs" className="px-3 py-2 text-gray-700 hover:text-blue-600">FAQs</Link>
                    <Link to="/admin/users" className="px-3 py-2 text-gray-700 hover:text-blue-600">Users</Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">Welcome, {user.username}</span>
                  <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-800">Dashboard</Link>
                  <button onClick={handleLogout} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800">Login</Link>
                  <Link to="/register" className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          FAQ Generator © 2024
        </div>
      </footer>
    </div>
  );
};

export default Layout;