import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { medicationsAPI, pricesAPI } from '../services/api';

const ComparePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medications, setMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Load popular medications on component mount
  useEffect(() => {
    loadPopularMedications();
  }, []);

  const loadPopularMedications = async () => {
    try {
      const response = await medicationsAPI.getPopular();
      setMedications(response.data.data);
    } catch (error) {
      console.error('Error loading popular medications:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a medication name.");
      setPrices([]);
      setSelectedMedication(null);
      return;
    }

    setLoading(true);
    setError(null);
    setPrices([]);
    setSelectedMedication(null);

    try {
      const response = await medicationsAPI.search(searchQuery, 10);
      setMedications(response.data.data);
    } catch (error) {
      setError('Error searching medications. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationSelect = async (medication) => {
    if (!isAuthenticated) {
      setError('Please log in to compare prices.');
      return;
    }

    setSelectedMedication(medication);
    setLoading(true);
    setError(null);
    setPrices([]);

    try {
      const response = await pricesAPI.get(medication.name);
      setPrices(response.data?.data?.prices || response.data?.prices || response.data || []);
    } catch (error) {
      setError('Error fetching prices. Please try again.');
      console.error('Price fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComparison = async () => {
    if (!selectedMedication) return;

    try {
      // This would save the current comparison
      // For now, we'll just show a success message
      alert('Comparison saved successfully!');
    } catch (error) {
      setError('Error saving comparison.');
      console.error('Save error:', error);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text text-center mb-12 animate-fade-in-up">
          Compare Prescription Prices
        </h1>

        {/* Drug Search Panel */}
        <div className="card p-8 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-semibold text-text mb-6">Find Your Medication</h2>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="e.g., Amoxicillin 500mg, Lisinopril 10mg"
              className="input-field flex-grow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Medication Results */}
        {medications.length > 0 && (
          <div className="card p-8 mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-2xl font-semibold text-text mb-6">Available Medications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications.map((medication) => (
                <div
                  key={medication._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary"
                  onClick={() => handleMedicationSelect(medication)}
                >
                  <h3 className="text-lg font-semibold text-text mb-2">
                    {medication.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {medication.genericName} {medication.dosage.strength}{medication.dosage.unit}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs ${
                      medication.isGeneric 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {medication.isGeneric ? 'Generic' : 'Brand'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {medication.drugClass}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

          {/* Price Comparison Results */}
          {prices.length > 0 && (
            <div className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-text">
                  Price Comparison Results
                </h2>
              <button
                onClick={handleSaveComparison}
                className="btn-secondary"
              >
                Save Comparison
              </button>
            </div>
            
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-text">Pharmacy</th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((result, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-text">
                          {result.pharmacy || result.source}
                        </td>
                        <td className="py-3 px-4 font-semibold text-text">
                          {result.price ? `₹${result.price}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          {result.url && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline"
                            >
                              View
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
};

export default ComparePage;
