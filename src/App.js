import React, { useState, useEffect } from 'react';
import { Sun, Moon, ArrowLeft, Settings } from 'lucide-react';
import MealTracker from './components/MealTracker';
import StatsDashboard from './components/StatsDashboard';
import DateNavigator from './components/DateNavigator';
import CalendarView from './components/CalendarView';
import SettingsPage from './components/SettingsPage';
import CustomTitleBar from './components/CustomTitleBar';
import VersionDisplay from './components/VersionDisplay';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [darkMode, setDarkMode] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Wait for React to fully hydrate and render
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Increased to 1 second for better stability

    return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Show loading screen initially
  if (isLoading) {
    return <LoadingScreen darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ease-in-out ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Custom Title Bar */}
      <CustomTitleBar darkMode={darkMode} />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Meal Tracker
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSettings ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h2>
            </div>
            <SettingsPage onClose={() => setShowSettings(false)} />
          </div>
        ) : showCalendar ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCalendar(false)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Calendar View
              </h2>
            </div>
            <CalendarView 
              currentDate={currentDate} 
              onDateChange={setCurrentDate}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <DateNavigator 
              currentDate={currentDate} 
              onDateChange={setCurrentDate}
              onCalendarClick={() => setShowCalendar(true)}
            />
            <StatsDashboard />
            <MealTracker date={currentDate} />
          </div>
        )}
      </main>
      
      {/* Version Display */}
      <VersionDisplay darkMode={darkMode} version="1.0.0" />
    </div>
  );
}

export default App;
