const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getMeals: (date) => ipcRenderer.invoke('get-meals', date),
  markMealComplete: (date, mealType) => ipcRenderer.invoke('mark-meal-complete', date, mealType),
  getStats: (period, startDate) => ipcRenderer.invoke('get-stats', period, startDate),
  getDailyStats: (date) => ipcRenderer.invoke('get-daily-stats', date),
  clearAllData: () => ipcRenderer.invoke('clear-all-data')
});
