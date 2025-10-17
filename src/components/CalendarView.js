import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Coffee, Utensils, Moon } from 'lucide-react';

const CalendarView = ({ currentDate, onDateChange, onClose }) => {
  const [mealsData, setMealsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadMealsForMonth();
    loadStartDate();
  }, [currentMonth]);

  const loadStartDate = () => {
    try {
      const savedSettings = localStorage.getItem('mealTrackerSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setStartDate(settings.startDate || new Date().toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error loading start date:', error);
    }
  };

  const loadMealsForMonth = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const meals = {};
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        try {
          const dayMeals = await window.electronAPI.getMeals(dateStr);
          meals[dateStr] = dayMeals;
        } catch (error) {
          console.error(`Error loading meals for ${dateStr}:`, error);
        }
      }
      setMealsData(meals);
    } catch (error) {
      console.error('Error loading meals for month:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getMealStats = (date) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date).toISOString().split('T')[0];
    const dayMeals = mealsData[dateStr];
    
    // If date is before start date, don't show as missed
    if (dateStr < startDate) {
      return { completed: 0, total: 0, meals: { breakfast: false, lunch: false, dinner: false }, beforeStart: true };
    }
    
    if (!dayMeals) {
      return { completed: 0, total: 3, meals: { breakfast: false, lunch: false, dinner: false } };
    }

    const completed = Object.values(dayMeals).filter(meal => meal.completed).length;
    const meals = {
      breakfast: dayMeals.breakfast?.completed || false,
      lunch: dayMeals.lunch?.completed || false,
      dinner: dayMeals.dinner?.completed || false
    };

    return { completed, total: 3, meals };
  };

  const getMealMissStats = () => {
    const stats = { breakfast: 0, lunch: 0, dinner: 0 };
    let totalDays = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate the actual number of days from start date to today
    const startDateObj = new Date(startDate);
    const todayObj = new Date(today);
    const daysDiff = Math.ceil((todayObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;
    
    // Only count days from start date up to today (not future dates)
    Object.entries(mealsData).forEach(([dateStr, dayMeals]) => {
      if (dateStr >= startDate && dateStr <= today) {
        totalDays++;
        if (!dayMeals.breakfast?.completed) stats.breakfast++;
        if (!dayMeals.lunch?.completed) stats.lunch++;
        if (!dayMeals.dinner?.completed) stats.dinner++;
      }
    });

    return { stats, totalDays, expectedDays: daysDiff };
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const handleDateClick = (day) => {
    if (day) {
      const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
      onDateChange(dateStr);
      onClose();
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth();
  const mealMissStats = getMealMissStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2"></div>;
            }

            const stats = getMealStats(day);
            const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
            const isSelected = currentDate === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
            const isFuture = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) > new Date();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`p-2 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isToday
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : stats.beforeStart
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                    : isFuture
                    ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="text-sm font-medium mb-1">{day}</div>
                <div className="text-xs mb-2">
                  {stats.beforeStart ? '-' : `${stats.completed}/${stats.total}`}
                </div>
                {!stats.beforeStart && (
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full ${stats.meals.breakfast ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${stats.meals.lunch ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${stats.meals.dinner ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Missed Meals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Most Missed Meals
          </h4>
          <div className="space-y-3">
            {Object.entries(mealMissStats.stats)
              .sort(([,a], [,b]) => b - a)
              .map(([meal, count]) => {
                const percentage = Math.round((count / mealMissStats.totalDays) * 100);
                const mealConfig = {
                  breakfast: { name: 'Breakfast', icon: Coffee, color: 'text-orange-500' },
                  lunch: { name: 'Lunch', icon: Utensils, color: 'text-green-500' },
                  dinner: { name: 'Dinner', icon: Moon, color: 'text-purple-500' }
                };
                const config = mealConfig[meal];
                const Icon = config.icon;

                return (
                  <div key={meal} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <span className="text-gray-700 dark:text-gray-300">{config.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {count} days ({percentage}%)
                      </div>
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Summary
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Days Since Start</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {mealMissStats.expectedDays} days
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Days with Data</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {mealMissStats.totalDays} days
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Perfect Days (3/3)</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {Object.entries(mealsData).filter(([dateStr, day]) => 
                  dateStr >= startDate && dateStr <= new Date().toISOString().split('T')[0] && Object.values(day).every(meal => meal.completed)
                ).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Average Daily Score</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {mealMissStats.totalDays > 0 ? Math.round(
                  Object.entries(mealsData)
                    .filter(([dateStr]) => dateStr >= startDate && dateStr <= new Date().toISOString().split('T')[0])
                    .reduce((sum, [, day]) => 
                      sum + Object.values(day).filter(meal => meal.completed).length, 0
                    ) / mealMissStats.totalDays * 100
                ) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
