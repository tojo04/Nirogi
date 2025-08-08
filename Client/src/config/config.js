const config = {
    // API Configuration
    api: {
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
      // Increase default timeout to accommodate scraping on /prices
      timeout: 30000,
    },
    
    // App Configuration
    app: {
      name: 'BoltRx',
      version: '1.0.0',
      description: 'Prescription affordability engine',
    },
    
    // Feature Flags
    features: {
      enableRegistration: true,
      enableAdminPanel: true,
      enableAnalytics: true,
    },
    
    // Default Settings
    defaults: {
      searchLimit: 10,
      maxDistance: 10, // miles
      defaultLocation: {
        coordinates: [-73.935242, 40.730610], // NYC coordinates
        zipCode: '10001'
      }
    }
  };
  
  export default config; 