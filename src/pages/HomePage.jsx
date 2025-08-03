import React from 'react';
import { Link } from 'react-router-dom';
// Using Tailwind CSS animations as defined in tailwind.config.js

// Icons (using simple SVG placeholders for now, can be replaced with actual icon library like Heroicons)
const SearchIcon = () => (
  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);

const BellIcon = () => (
  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944 11.955 11.955 0 01.382 8.984L12 21l11.618-12.016A11.955 11.955 0 0112 2.944z"></path>
  </svg>
);

const LockClosedIcon = () => (
  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
  </svg>
);


const HomePage = () => {
  const featureCards = [
    {
      icon: <SearchIcon />,
      title: "Real-time Price Comparison",
      description: "Instantly compare prices from thousands of pharmacies near you, ensuring you always get the best deal.",
      delay: 0.2
    },
    {
      icon: <BellIcon />,
      title: "Personalized Savings Alerts",
      description: "Get notified when prices drop or new discounts become available for your medications.",
      delay: 0.4
    },
    {
      icon: <ShieldCheckIcon />,
      title: "Insurance & Discount Integration",
      description: "Seamlessly apply your insurance and discover hidden savings with integrated discount programs.",
      delay: 0.6
    },
    {
      icon: <LockClosedIcon />,
      title: "Secure & Private",
      description: "Your health data is protected with industry-leading encryption and privacy standards.",
      delay: 0.8
    },
  ];

  return (
    <div className="relative z-10">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[calc(100vh-80px)] text-center px-4 py-16 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Affordable</span> Prescriptions
          </h1>
          <p className="text-xl md:text-2xl text-textSecondary mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            Compare medication prices across pharmacies, insurance plans, and discount programs effortlessly.
          </p>
          <Link to="/compare" className="btn-primary animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            Start Comparing Now
          </Link>
        </div>
        {/* Subtle floating elements for visual interest */}
        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-primary/10 rounded-full mix-blend-screen filter blur-xl animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-accent/10 rounded-full mix-blend-screen filter blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/2 w-20 h-20 bg-secondary/10 rounded-full mix-blend-screen filter blur-xl animate-float" style={{ animationDelay: '0.5s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-surface/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 animate-fade-in-up">
            Why Choose <span className="text-primary">BoltRx</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureCards.map((card, index) => (
              <div
                key={index}
                className="card flex flex-col items-center p-8 text-center transform hover:scale-105 transition-transform duration-300 ease-in-out animate-fade-in-up"
                style={{ animationDelay: `${card.delay}s` }}
              >
                <div className="mb-6 p-4 rounded-full bg-background/50 border border-border shadow-inner-glow">
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{card.title}</h3>
                <p className="text-textSecondary text-base">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Ready to Save on Your Medications?
          </h2>
          <p className="text-xl text-textSecondary mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            Join thousands finding better prices and taking control of their health.
          </p>
          <Link to="/login" className="btn-primary animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            Get Started Today
          </Link>
        </div>
        {/* Background glow effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse-glow"></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
