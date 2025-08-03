import React, { useState } from 'react';
// Using Tailwind CSS animations as defined in tailwind.config.js

// Mock Data for demonstration
const mockMedications = [
  { id: 'med1', name: 'Amoxicillin 500mg', generic: true, dosage: '500mg', quantity: 30 },
  { id: 'med2', name: 'Lisinopril 10mg', generic: true, dosage: '10mg', quantity: 90 },
  { id: 'med3', name: 'Atorvastatin 20mg', generic: true, dosage: '20mg', quantity: 30 },
  { id: 'med4', name: 'Metformin 500mg ER', generic: true, dosage: '500mg', quantity: 60 },
  { id: 'med5', name: 'Ventolin HFA Inhaler', generic: false, dosage: '90mcg/puff', quantity: 1 },
];

const mockPharmacies = [
  { id: 'ph1', name: 'Local Pharmacy A', address: '123 Main St', distance: '2.5 mi', rating: 4.8 },
  { id: 'ph2', name: 'Chain Pharmacy B', address: '456 Oak Ave', distance: '0.8 mi', rating: 4.2 },
  { id: 'ph3', name: 'Discount Pharmacy C', address: '789 Pine Ln', distance: '5.1 mi', rating: 4.5 },
  { id: 'ph4', name: 'Online Pharmacy D', address: 'Web-based', distance: 'N/A', rating: 4.9 },
];

const generateMockResults = (medicationName) => {
  const results = [];
  const basePrice = Math.random() * 100 + 20; // Base price between $20 and $120

  mockPharmacies.forEach(pharmacy => {
    const priceVariation = (Math.random() - 0.5) * 0.3; // +/- 15%
    const finalPrice = (basePrice * (1 + priceVariation)).toFixed(2);
    const savings = (basePrice - parseFloat(finalPrice)).toFixed(2);
    const discountApplied = Math.random() > 0.6 ? 'GoodRx' : 'None'; // Simulate discount
    const insuranceApplied = Math.random() > 0.7 ? 'BlueCross' : 'None'; // Simulate insurance

    results.push({
      pharmacy: pharmacy.name,
      address: pharmacy.address,
      distance: pharmacy.distance,
      price: parseFloat(finalPrice),
      savings: parseFloat(savings),
      discount: discountApplied,
      insurance: insuranceApplied,
      rating: pharmacy.rating,
    });
  });

  // Sort by price for better comparison
  return results.sort((a, b) => a.price - b.price);
};

const ComparePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a medication name.");
      setResults([]);
      setSelectedMedication(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedMedication(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const foundMed = mockMedications.find(med =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundMed) {
      setSelectedMedication(foundMed);
      setResults(generateMockResults(foundMed.name));
    } else {
      setError(`No results found for "${searchQuery}". Please try another medication.`);
    }
    setLoading(false);
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
            />
            <button type="submit" className="btn-primary flex-shrink-0">
              Search & Compare
            </button>
          </form>
          {error && (
            <p className="text-error mt-4 text-center animate-fade-in">{error}</p>
          )}
        </div>

        {/* Filters and Results */}
        {loading && (
          <div className="text-center py-10 animate-fade-in">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mb-4 mx-auto" style={{ borderTopColor: 'var(--primary)' }}></div>
            <p className="text-textSecondary text-lg">Searching for the best prices...</p>
          </div>
        )}

        {!loading && selectedMedication && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Panel */}
            <div className="lg:col-span-1 card p-6 animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl font-semibold text-text mb-6">Refine Your Search</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="dosage" className="block text-textSecondary text-sm font-medium mb-2">Dosage</label>
                  <select id="dosage" className="input-field">
                    <option>500mg</option>
                    <option>250mg</option>
                    <option>100mg</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-textSecondary text-sm font-medium mb-2">Quantity</label>
                  <select id="quantity" className="input-field">
                    <option>30</option>
                    <option>60</option>
                    <option>90</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="location" className="block text-textSecondary text-sm font-medium mb-2">Location</label>
                  <input type="text" id="location" placeholder="Your Zip Code" className="input-field" />
                </div>
                <div>
                  <label htmlFor="pharmacyType" className="block text-textSecondary text-sm font-medium mb-2">Pharmacy Type</label>
                  <select id="pharmacyType" className="input-field">
                    <option>All</option>
                    <option>Chain Pharmacies</option>
                    <option>Independent Pharmacies</option>
                    <option>Online Pharmacies</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="insurance" className="block text-textSecondary text-sm font-medium mb-2">Insurance Provider</label>
                  <input type="text" id="insurance" placeholder="e.g., BlueCross, Aetna" className="input-field" />
                </div>
                <div>
                  <label htmlFor="discount" className="block text-textSecondary text-sm font-medium mb-2">Discount Program</label>
                  <select id="discount" className="input-field">
                    <option>None</option>
                    <option>GoodRx</option>
                    <option>SingleCare</option>
                    <option>RxSaver</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="lg:col-span-3 table-container animate-slide-in-right" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-2xl font-semibold text-text p-6 border-b border-border">
                Results for <span className="text-primary">{selectedMedication.name}</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="table-header">
                    <tr>
                      <th scope="col">Pharmacy</th>
                      <th scope="col">Address / Distance</th>
                      <th scope="col">Price</th>
                      <th scope="col">Savings</th>
                      <th scope="col">Discount/Insurance</th>
                      <th scope="col">Rating</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {results.length > 0 ? (
                      results.map((result, index) => (
                        <tr key={index} className="table-row">
                          <td className="font-medium text-primary">{result.pharmacy}</td>
                          <td>{result.address} <span className="text-textSecondary text-sm">({result.distance})</span></td>
                          <td className="text-lg font-bold text-success">${result.price.toFixed(2)}</td>
                          <td className={`${result.savings > 0 ? 'text-success' : 'text-textSecondary'}`}>
                            {result.savings > 0 ? `$${result.savings.toFixed(2)}` : 'N/A'}
                          </td>
                          <td>
                            {result.discount !== 'None' && <span className="bg-accent/20 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">{result.discount}</span>}
                            {result.insurance !== 'None' && <span className="bg-primary/20 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">{result.insurance}</span>}
                            {result.discount === 'None' && result.insurance === 'None' && <span className="text-textSecondary text-xs">None</span>}
                          </td>
                          <td>
                            <span className="flex items-center text-warning">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.539 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.565-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path></svg>
                              {result.rating.toFixed(1)}
                            </span>
                          </td>
                          <td>
                            <button className="btn-secondary text-sm px-4 py-2">View Details</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-textSecondary">
                          No comparison results available. Try searching for a medication!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
