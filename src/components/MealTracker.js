import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Coffee, Utensils, Moon } from 'lucide-react';
import MealCard from './MealCard';

const MealTracker = ({ date }) => {
  const [meals, setMeals] = useState({
    breakfast: { meal_type: 'breakfast', completed: false, completed_at: null },
    lunch: { meal_type: 'lunch', completed: false, completed_at: null },
    dinner: { meal_type: 'dinner', completed: false, completed_at: null }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeals();
  }, [date]);

  const loadMeals = async () => {
    try {
      setLoading(true);
      const mealsData = await window.electronAPI.getMeals(date);
      setMeals(mealsData);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealComplete = async (mealType) => {
    try {
      await window.electronAPI.markMealComplete(date, mealType);
      setMeals(prev => ({
        ...prev,
        [mealType]: {
          ...prev[mealType],
          completed: true,
          completed_at: new Date().toISOString()
        }
      }));
      
      // Dispatch custom event to notify stats to refresh
      window.dispatchEvent(new CustomEvent('mealCompleted'));
    } catch (error) {
      console.error('Error marking meal complete:', error);
    }
  };

  const mealConfig = {
    breakfast: {
      title: 'Breakfast',
      icon: Coffee,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      time: '7:00 AM - 10:00 AM'
    },
    lunch: {
      title: 'Lunch',
      icon: Utensils,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      time: '12:00 PM - 2:00 PM'
    },
    dinner: {
      title: 'Dinner',
      icon: Moon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      time: '6:00 PM - 9:00 PM'
    }
  };

  const completedCount = Object.values(meals).filter(meal => meal.completed).length;
  const totalMeals = Object.keys(meals).length;
  const progressPercentage = Math.round((completedCount / totalMeals) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(meals).map(([mealType, mealData]) => (
        <MealCard
          key={mealType}
          mealType={mealType}
          mealData={mealData}
          config={mealConfig[mealType]}
          onComplete={() => handleMealComplete(mealType)}
        />
      ))}
    </div>
  );
};

export default MealTracker;
