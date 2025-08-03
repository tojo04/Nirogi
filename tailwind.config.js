/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D32F2F', // Strong Red
        secondary: '#FFFFFF', // Pure White
        accent: '#FFCDD2', // Light Red/Pink for highlights
        background: '#F8F8F8', // Very Light Grey
        surface: '#FFFFFF', // White for cards/elements
        text: '#212121', // Dark Grey
        textSecondary: '#757575', // Medium Grey
        border: '#E0E0E0', // Light Grey
        success: '#4CAF50', // Green
        warning: '#FFC107', // Orange
        error: '#C62828', // Darker Red
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Modern sans-serif
        serif: ['Playfair Display', 'serif'], // Elegant serif
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(211, 47, 47, 0.4)', // Red glow
        'glow-accent': '0 0 20px rgba(255, 205, 210, 0.6)', // Light red glow
        'inner-glow': 'inset 0 0 10px rgba(211, 47, 47, 0.2)', // Red inner glow
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(211, 47, 47, 0.3)' }, // Red pulse
          '50%': { boxShadow: '0 0 30px rgba(211, 47, 47, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
