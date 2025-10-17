import React from 'react';

const VersionDisplay = ({ darkMode, version = "1.0.0" }) => {
  return (
    <div className={`version-display fixed bottom-4 right-4 text-xs select-none pointer-events-none ${
      darkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      Version {version}
    </div>
  );
};

export default VersionDisplay;
