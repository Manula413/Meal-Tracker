import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Calendar, Bell, Save, RotateCcw, AlertTriangle } from 'lucide-react';

const SettingsPage = ({ onClose }) => {
  const [settings, setSettings] = useState({
    mealTimes: {
      breakfast: { start: '07:00', end: '10:00' },
      lunch: { start: '12:00', end: '14:00' },
      dinner: { start: '18:00', end: '21:00' }
    },
    startDate: new Date().toISOString().split('T')[0],
    notifications: {
      enabled: false,
      breakfast: true,
      lunch: true,
      dinner: true
    },
    reminders: {
      enabled: false,
      interval: 30 // minutes
    },
    dataRetention: {
      keepData: true,
      autoBackup: false
    }
  });

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from localStorage or database
      const savedSettings = localStorage.getItem('mealTrackerSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      localStorage.setItem('mealTrackerSettings', JSON.stringify(settings));
      setSuccessMessage('Settings saved successfully!');
      setShowSuccessModal(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSuccessMessage(`Error saving settings: ${error.message || 'Please try again.'}`);
      setShowSuccessModal(true);
    }
  };

  const clearHistory = async () => {
    try {
      console.log('Attempting to clear all data...');
      
      // Test if electronAPI is available
      if (!window.electronAPI || !window.electronAPI.clearAllData) {
        throw new Error('Electron API not available. Make sure you are running the app in Electron.');
      }
      
      const result = await window.electronAPI.clearAllData();
      console.log('Clear data result:', result);
      
      if (result && result.success) {
        setShowClearConfirm(false);
        setSuccessMessage('All meal history has been cleared successfully.');
        setShowSuccessModal(true);
        // Refresh the page to reflect the cleared data after a delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Clear operation did not return success');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      setSuccessMessage(`Error clearing history: ${error.message || 'Please try again.'}`);
      setShowSuccessModal(true);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      mealTimes: {
        breakfast: { start: '07:00', end: '10:00' },
        lunch: { start: '12:00', end: '14:00' },
        dinner: { start: '18:00', end: '21:00' }
      },
      startDate: new Date().toISOString().split('T')[0],
      notifications: {
        enabled: false,
        breakfast: true,
        lunch: true,
        dinner: true
      },
      reminders: {
        enabled: false,
        interval: 30
      },
      dataRetention: {
        keepData: true,
        autoBackup: false
      }
    });
  };

  const updateMealTime = (meal, timeType, value) => {
    setSettings(prev => ({
      ...prev,
      mealTimes: {
        ...prev.mealTimes,
        [meal]: {
          ...prev.mealTimes[meal],
          [timeType]: value
        }
      }
    }));
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Meal Times Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Meal Times Configuration
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(settings.mealTimes).map(([meal, times]) => {
            const mealNames = {
              breakfast: 'Breakfast',
              lunch: 'Lunch',
              dinner: 'Dinner'
            };
            
            return (
              <div key={meal} className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {mealNames[meal]}
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={times.start}
                      onChange={(e) => updateMealTime(meal, 'start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={times.end}
                      onChange={(e) => updateMealTime(meal, 'end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Date Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tracking Start Date
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Set the date when you started tracking meals. Days before this date won't be counted as missed meals in statistics.
        </p>
        <div className="max-w-xs">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={settings.startDate}
            onChange={(e) => setSettings(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Enable Notifications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get reminded about meal times</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.enabled}
                onChange={(e) => updateSetting('notifications', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.notifications.enabled && (
            <div className="ml-4 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Breakfast Reminders</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.breakfast}
                    onChange={(e) => updateSetting('notifications', 'breakfast', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Lunch Reminders</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.lunch}
                    onChange={(e) => updateSetting('notifications', 'lunch', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Dinner Reminders</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.dinner}
                    onChange={(e) => updateSetting('notifications', 'dinner', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Data Management
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-200">Clear All History</h4>
              <p className="text-sm text-red-700 dark:text-red-300">Permanently delete all meal tracking data</p>
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Data
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200">Reset to Defaults</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">Reset all settings to default values</p>
            </div>
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={resetToDefaults}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="h-4 w-4 inline mr-2" />
          Reset
        </button>
        <button
          onClick={saveSettings}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Save className="h-4 w-4 inline mr-2" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Data Deletion
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to permanently delete all meal tracking data? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              {successMessage.includes('Error') ? (
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              ) : (
                <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {successMessage.includes('Error') ? 'Error' : 'Success'}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {successMessage}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  successMessage.includes('Error')
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
