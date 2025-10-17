const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    const userDataPath = app.getPath('userData');
    this.dataPath = path.join(userDataPath, 'meals.json');
    this.data = {};
  }

  async initialize() {
    try {
      // Ensure userData directory exists
      const userDataPath = app.getPath('userData');
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }

      // Load existing data or create new file
      if (fs.existsSync(this.dataPath)) {
        const fileContent = fs.readFileSync(this.dataPath, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = {};
        this.saveData();
      }
      
      console.log('Connected to JSON database');
      return Promise.resolve();
    } catch (err) {
      console.error('Error opening database:', err);
      return Promise.reject(err);
    }
  }

  saveData() {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.error('Error saving data:', err);
    }
  }

  async getMealsForDate(date) {
    try {
      // Ensure all three meals exist
      const meals = {
        breakfast: { meal_type: 'breakfast', completed: false, completed_at: null },
        lunch: { meal_type: 'lunch', completed: false, completed_at: null },
        dinner: { meal_type: 'dinner', completed: false, completed_at: null }
      };

      // Load data for this date if it exists
      if (this.data[date]) {
        Object.keys(meals).forEach(mealType => {
          if (this.data[date][mealType]) {
            meals[mealType] = {
              meal_type: mealType,
              completed: Boolean(this.data[date][mealType].completed),
              completed_at: this.data[date][mealType].completed_at
            };
          }
        });
      }

      return meals;
    } catch (err) {
      throw err;
    }
  }

  async markMealComplete(date, mealType) {
    try {
      // Initialize date if it doesn't exist
      if (!this.data[date]) {
        this.data[date] = {};
      }

      // Mark meal as complete
      this.data[date][mealType] = {
        completed: true,
        completed_at: new Date().toISOString()
      };

      // Save to file
      this.saveData();
      
      return { success: true };
    } catch (err) {
      throw err;
    }
  }

  async getStats(period, startDate = null) {
    try {
      let dateFilter;
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Use provided start date or default to today
      if (!startDate) {
        startDate = today;
      }
      
      switch (period) {
        case 'daily':
          dateFilter = today;
          break;
        case 'weekly':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          dateFilter = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = monthStart.toISOString().split('T')[0];
          break;
        default:
          dateFilter = today;
      }

      // Count completed meals from the data
      let completedMeals = 0;
      const dates = Object.keys(this.data);
      
      for (const date of dates) {
        if (date >= dateFilter && date <= today) {
          const dayData = this.data[date];
          Object.values(dayData).forEach(meal => {
            if (meal.completed) {
              completedMeals++;
            }
          });
        }
      }
      
      // Calculate smart totals based on actual tracking period
      let total;
      if (period === 'daily') {
        total = 3;
      } else if (period === 'weekly') {
        // Calculate remaining days in current week (Monday to Sunday) from start date
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday of current week
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday of current week
        
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const weekEndStr = weekEnd.toISOString().split('T')[0];
        
        // If start date is within this week, use start date as the beginning
        // If start date is before this week, use this week's Monday
        // If start date is after this week, use start date as both start and end
        let actualWeekStart, actualWeekEnd;
        if (startDate >= weekStartStr && startDate <= weekEndStr) {
          // Start date is within current week
          actualWeekStart = startDate;
          actualWeekEnd = weekEndStr;
        } else if (startDate < weekStartStr) {
          // Start date is before current week, use current week
          actualWeekStart = weekStartStr;
          actualWeekEnd = weekEndStr;
        } else {
          // Start date is after current week, use start date only
          actualWeekStart = startDate;
          actualWeekEnd = startDate;
        }
        
        const daysInWeek = Math.ceil((new Date(actualWeekEnd) - new Date(actualWeekStart)) / (1000 * 60 * 60 * 24)) + 1;
        total = Math.max(1, daysInWeek) * 3; // At least 1 day, 3 meals per day
        console.log(`Weekly stats: startDate=${startDate}, weekStart=${weekStartStr}, weekEnd=${weekEndStr}, actualWeekStart=${actualWeekStart}, actualWeekEnd=${actualWeekEnd}, daysInWeek=${daysInWeek}, total=${total}`);
      } else if (period === 'monthly') {
        // Calculate remaining days in current month from start date
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const monthStartStr = monthStart.toISOString().split('T')[0];
        const monthEndStr = monthEnd.toISOString().split('T')[0];
        const actualMonthStart = startDate > monthStartStr ? startDate : monthStartStr;
        const actualMonthEnd = startDate > monthEndStr ? startDate : monthEndStr;
        
        const daysInMonth = Math.ceil((new Date(actualMonthEnd) - new Date(actualMonthStart)) / (1000 * 60 * 60 * 24)) + 1;
        total = Math.max(1, daysInMonth) * 3; // At least 1 day, 3 meals per day
        console.log(`Monthly stats: startDate=${startDate}, monthStart=${monthStartStr}, monthEnd=${monthEndStr}, actualMonthStart=${actualMonthStart}, actualMonthEnd=${actualMonthEnd}, daysInMonth=${daysInMonth}, total=${total}`);
      } else {
        total = 3;
      }
      
      return {
        total: total,
        completed: completedMeals,
        percentage: total > 0 ? Math.round((completedMeals / total) * 100) : 0
      };
    } catch (err) {
      throw err;
    }
  }

  async getDailyStats(date) {
    try {
      const stats = {
        breakfast: false,
        lunch: false,
        dinner: false,
        completed: 0,
        total: 3
      };

      // Load data for this specific date
      if (this.data[date]) {
        Object.keys(stats).forEach(mealType => {
          if (mealType !== 'completed' && mealType !== 'total' && mealType !== 'percentage') {
            if (this.data[date][mealType] && this.data[date][mealType].completed) {
              stats[mealType] = true;
              stats.completed++;
            }
          }
        });
      }

      stats.percentage = Math.round((stats.completed / stats.total) * 100);
      return stats;
    } catch (err) {
      throw err;
    }
  }

  async clearAllData() {
    try {
      console.log('Clearing all data...');
      console.log('Current data before clear:', this.data);
      
      // Ensure data object exists
      if (!this.data) {
        this.data = {};
      }
      
      // Clear all data
      this.data = {};
      
      // Save the empty data
      this.saveData();
      
      console.log('Data cleared successfully');
      console.log('Data after clear:', this.data);
      
      return { success: true, message: 'All data cleared successfully' };
    } catch (err) {
      console.error('Error clearing data:', err);
      throw new Error(`Failed to clear data: ${err.message}`);
    }
  }

  close() {
    // Save data before closing
    this.saveData();
    console.log('Database connection closed');
  }
}

module.exports = DatabaseManager;
