import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmaciesAPI } from '../services/api';

const PharmaciesPage = () => {
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    try {
      setLoading(true);
      const response = await pharmaciesAPI.getAll();
      setPharmacies(response.data.data);
    } catch (error) {
      console.error('Error loading pharmacies:', error);
      setError('Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pharmacy.address?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pharmacy.address?.state?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || pharmacy.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pharmacies...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Pharmacies</h1>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Back to Dashboard
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search pharmacies by name, city, or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Types</option>
                  <option value="chain">Chain Pharmacies</option>
                  <option value="independent">Independent Pharmacies</option>
                  <option value="online">Online Pharmacies</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredPharmacies.length} of {pharmacies.length} pharmacies
              </p>
            </div>

            {/* Pharmacies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPharmacies.map((pharmacy) => (
                <div key={pharmacy._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{pharmacy.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      pharmacy.type === 'chain' ? 'bg-blue-100 text-blue-800' : 
                      pharmacy.type === 'independent' ? 'bg-green-100 text-green-800' : 
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {pharmacy.type}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      {pharmacy.address?.street}
                    </p>
                    <p className="text-sm text-gray-600">
                      {pharmacy.address?.city}, {pharmacy.address?.state} {pharmacy.address?.zipCode}
                    </p>
                    {pharmacy.contact?.phone && (
                      <p className="text-sm text-gray-600">
                        📞 {pharmacy.contact.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-sm text-gray-600">
                        {pharmacy.rating?.average || 'N/A'} ({pharmacy.rating?.count || 0} reviews)
                      </span>
                    </div>
                    {pharmacy.verified && (
                      <span className="text-green-600 text-xs font-medium">✓ Verified</span>
                    )}
                  </div>

                  {pharmacy.services && pharmacy.services.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {pharmacy.services.slice(0, 3).map((service, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {service.replace('_', ' ')}
                          </span>
                        ))}
                        {pharmacy.services.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{pharmacy.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {pharmacy.hours && (
                    <div className="text-xs text-gray-500">
                      <p className="font-medium mb-1">Hours:</p>
                      <p>Mon-Fri: {pharmacy.hours.monday?.open} - {pharmacy.hours.monday?.close}</p>
                      <p>Sat-Sun: {pharmacy.hours.saturday?.open} - {pharmacy.hours.saturday?.close}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredPharmacies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No pharmacies found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmaciesPage; 