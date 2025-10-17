import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

const MealCard = ({ mealType, mealData, config, onComplete }) => {
  const { title, icon: Icon, color, bgColor, borderColor, time } = config;
  const { completed, completed_at } = mealData;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`meal-card ${completed ? 'completed' : ''} ${bgColor} ${borderColor} p-6 border border-gray-200 dark:border-gray-600`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${bgColor} ${borderColor} border`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {time}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          {completed ? (
            <CheckCircle className="h-8 w-8 text-green-500" />
          ) : (
            <Circle className="h-8 w-8 text-gray-400" />
          )}
        </div>
      </div>

      {completed && completed_at && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
            Completed at {formatTime(completed_at)}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {!completed ? (
          <button
            onClick={onComplete}
            className="w-full flex items-center justify-center space-x-2 py-3 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Mark as Complete</span>
          </button>
        ) : (
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400 font-medium">
              Meal completed!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealCard;
