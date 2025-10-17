import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Maximize2 } from 'lucide-react';

const CustomTitleBar = ({ darkMode }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if we're running in Electron
    setIsElectron(!!window.electronAPI);
    
    // Check if window is maximized on mount (only in Electron)
    if (window.electronAPI?.isMaximized) {
      window.electronAPI.isMaximized().then(setIsMaximized);
    }
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximize) {
      window.electronAPI.maximize();
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    }
  };

  // Don't render title bar in browser (dev server)
  if (!isElectron) {
    return null;
  }

  return (
    <div className={`title-bar flex items-center justify-between h-10 px-4 border-b ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Title */}
      <div className="flex items-center">
        <span className={`text-sm font-medium ${
          darkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          Meal Tracker
        </span>
      </div>

      {/* Window Controls - Windows style */}
      <div className="flex items-center">
        <button
          onClick={handleMinimize}
          className={`w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
          title="Minimize"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <button
          onClick={handleMaximize}
          className={`w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? <Square className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
        </button>
        
        <button
          onClick={handleClose}
          className={`w-10 h-10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CustomTitleBar;
