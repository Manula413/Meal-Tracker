import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, Info, RefreshCw } from 'lucide-react';

const StatsDashboard = () => {
  const [stats, setStats] = useState({
    daily: { total: 3, completed: 0, percentage: 0 },
    weekly: { total: 21, completed: 0, percentage: 0 },
    monthly: { total: 90, completed: 0, percentage: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  // Listen for meal completion events
  useEffect(() => {
    const handleMealComplete = () => {
      loadStats();
    };

    // Listen for custom events or use a more direct approach
    window.addEventListener('mealCompleted', handleMealComplete);
    
    // Also refresh stats periodically (every 5 seconds) as a fallback
    const interval = setInterval(loadStats, 5000);

    return () => {
      window.removeEventListener('mealCompleted', handleMealComplete);
      clearInterval(interval);
    };
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get start date from settings
      let startDate = new Date().toISOString().split('T')[0];
      try {
        const settings = localStorage.getItem('mealTrackerSettings');
        if (settings) {
          const parsedSettings = JSON.parse(settings);
          startDate = parsedSettings.startDate || startDate;
        }
      } catch (error) {
        console.error('Error loading start date from settings:', error);
      }
      
      const [dailyStats, weeklyStats, monthlyStats] = await Promise.all([
        window.electronAPI.getStats('daily', startDate),
        window.electronAPI.getStats('weekly', startDate),
        window.electronAPI.getStats('monthly', startDate)
      ]);

      setStats({
        daily: dailyStats,
        weekly: weeklyStats,
        monthly: monthlyStats
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakMessage = () => {
    const dailyPercentage = stats.daily.percentage;
    if (dailyPercentage === 100) {
      return "Perfect day! Keep it up!";
    } else if (dailyPercentage >= 66) {
      return "Great progress! Almost there!";
    } else if (dailyPercentage >= 33) {
      return "Good start! Keep going!";
    } else {
      return "Ready to start your day?";
    }
  };

  const getMotivationalMessage = () => {
    const weeklyPercentage = stats.weekly.percentage;
    if (weeklyPercentage >= 80) {
      return "You're crushing it this week!";
    } else if (weeklyPercentage >= 60) {
      return "Great momentum! Keep it up!";
    } else if (weeklyPercentage >= 40) {
      return "Making good progress!";
    } else {
      return "Every meal counts!";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Progress</span>
          </h3>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="How stats are calculated"
          >
            <Info className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={loadStats}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Refresh stats"
          >
            <RefreshCw className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {getStreakMessage()}
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <div className="font-medium mb-2">How stats are calculated:</div>
            <div>• <strong>Today:</strong> 3 meals (breakfast, lunch, dinner)</div>
            <div>• <strong>Week:</strong> Monday to Sunday from your start date</div>
            <div>• <strong>Month:</strong> From your start date to end of current month</div>
            <div className="text-blue-600 dark:text-blue-300 mt-2">
              💡 Stats adjust based on when you started tracking!
            </div>
          </div>
        </div>
      )}

      {/* Compact Statistics */}
      <div className="grid grid-cols-3 gap-3">
        {/* Daily Stats */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Today</span>
          </div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">
            {stats.daily.completed}/{stats.daily.total}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.daily.percentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {stats.daily.percentage}%
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Week</span>
          </div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
            {stats.weekly.completed}/{stats.weekly.total}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.weekly.percentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {stats.weekly.percentage}%
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Target className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Month</span>
          </div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">
            {stats.monthly.completed}/{stats.monthly.total}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
            <div 
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.monthly.percentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {stats.monthly.percentage}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
