import React from 'react';

const LoadingScreen = ({ darkMode }) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center transition-all duration-500 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="text-center">
        <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${
          darkMode ? 'border-white' : 'border-gray-900'
        }`}></div>
        <p className={`mt-4 text-sm transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Loading Meal Tracker...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
