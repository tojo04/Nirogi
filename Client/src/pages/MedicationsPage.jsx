import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationsAPI } from '../services/api';

const MedicationsPage = () => {
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const response = await medicationsAPI.search('', 100);
      setMedications(response.data?.data ?? []);
    } catch (error) {
      console.error('Error loading medications:', error);
      setError('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedications = medications.filter((medication) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =

      (medication?.name?.toLowerCase() ?? '').includes(query) ||
      (medication?.brand?.toLowerCase() ?? '').includes(query);

    const matchesClass = filterClass === 'all' || medication?.drugClass === filterClass;

    return matchesSearch && matchesClass;
  });

  const drugClasses = [...new Set(medications.map(med => med?.drugClass).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading medications...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
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

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Search medications by name or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Drug Classes</option>
                    {drugClasses.map((drugClass) => (
                      <option key={drugClass} value={drugClass}>{drugClass}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredMedications.length} of {medications.length} medications
              </p>
            </div>

            {/* Medications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
<
                      <span className="font-medium">Brand:</span> {medication?.brand ?? 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Strength:</span> {`${medication?.strength ?? ''} ${medication?.unit ?? ''}`.trim() || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Class:</span> {medication?.drugClass ?? 'N/A'}
      </p>
                  </div>

                  {medication?.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {medication?.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    {medication?.indications?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Indications:</p>
                        <div className="flex flex-wrap gap-1">
                          {(medication.indications?.slice(0, 2) ?? []).map((indication, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {indication}
                            </span>
                          ))}
                          {medication.indications?.length > 2 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              +{(medication.indications?.length ?? 0) - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {medication?.sideEffects?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Side Effects:</p>
                        <div className="flex flex-wrap gap-1">
                          {(medication.sideEffects?.slice(0, 2) ?? []).map((effect, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              {effect}
                            </span>
                          ))}
                          {medication.sideEffects?.length > 2 && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              +{(medication.sideEffects?.length ?? 0) - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      {medication?.rxRequired && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Rx Required
                        </span>
                      )}
                      {medication?.controlledSubstance && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                          Controlled
                        </span>
                      )}
                      {medication?.fdaApproved && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          FDA Approved
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded ${
                      medication?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {medication?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredMedications.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No medications found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationsPage; 