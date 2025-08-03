import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const DashboardPage = () => {
  const { isAuthenticated, userRole, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to your Dashboard
              </h1>
              <button
                onClick={handleLogoutClick}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Logout
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Prescription Comparison
                </h3>
                <p className="text-blue-700 mb-4">
                  Compare prescription prices and find the most affordable options.
                </p>
                <button
                  onClick={() => navigate('/compare')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  Compare Now
                </button>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  Saved Comparisons
                </h3>
                <p className="text-green-700 mb-4">
                  View your previously saved prescription comparisons.
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md">
                  View Saved
                </button>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900 mb-2">
                  Profile Settings
                </h3>
                <p className="text-purple-700 mb-4">
                  Manage your account settings and preferences.
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md">
                  Settings
                </button>
              </div>
            </div>

            {userRole === 'admin' && (
              <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">
                  Admin Panel
                </h3>
                <p className="text-yellow-700 mb-4">
                  Access administrative features and manage the system.
                </p>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md">
                  Admin Panel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 