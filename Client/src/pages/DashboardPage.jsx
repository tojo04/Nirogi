import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';

const DashboardPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (loading) return; // Wait for auth check to finish
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadDashboardData();
    // eslint-disable-next-line
  }, [loading]); // Only run when loading changes

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.firstName || 'User'}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your prescription comparisons and account settings
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Logout
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Stats Cards */}
            {dashboardData?.stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Total Searches
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {dashboardData.stats.totalSearches}
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900 mb-2">
                    Saved Comparisons
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {dashboardData.stats.totalSaved}
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">
                    Total Savings
                  </h3>
                  <p className="text-3xl font-bold text-purple-600">
                    ${dashboardData.stats.totalSavings?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                <button 
                  onClick={() => navigate('/saved-comparisons')}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                >
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
                <button 
                  onClick={() => navigate('/profile')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Recent Comparisons */}
            {dashboardData?.recentComparisons && dashboardData.recentComparisons.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Comparisons</h2>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Medication
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Best Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Savings
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.recentComparisons.map((comparison, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {comparison.medication?.name || 'Unknown Medication'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {comparison.medication?.genericName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(comparison.searchDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${comparison.bestPrice?.toFixed(2) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                comparison.totalSavings > 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {comparison.totalSavings > 0 ? `$${comparison.totalSavings.toFixed(2)}` : 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Panel */}
            {user?.role === 'admin' && (
              <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">
                  Admin Panel
                </h3>
                <p className="text-yellow-700 mb-4">
                  Access administrative features and manage the system.
                </p>
                <button 
                  onClick={() => navigate('/admin')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md"
                >
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