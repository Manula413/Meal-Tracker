const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const DatabaseManager = require('./database');

let mainWindow;
let database;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Remove default frame
    titleBarStyle: 'hidden', // Hide default title bar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    icon: path.join(__dirname, '../../public/icon.png'),
    show: false
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // In packaged apps, the build files are in the app.asar or __dirname
    const indexPath = path.join(__dirname, 'index.html');
    mainWindow.loadFile(indexPath);
  }


  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle page load events to prevent white screen
  mainWindow.webContents.on('did-finish-load', () => {
    // Wait for React to fully render
    setTimeout(() => {
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
    }, 200);
  });

  // Handle navigation events
  mainWindow.webContents.on('dom-ready', () => {
    // Ensure the window is shown after DOM is ready
    setTimeout(() => {
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
    }, 100);
  });

  // Prevent navigation glitches
  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize database
async function initializeDatabase() {
  database = new DatabaseManager();
  await database.initialize();
}

// IPC handlers
ipcMain.handle('get-meals', async (event, date) => {
  return await database.getMealsForDate(date);
});

ipcMain.handle('mark-meal-complete', async (event, date, mealType) => {
  return await database.markMealComplete(date, mealType);
});

ipcMain.handle('get-stats', async (event, period, startDate = null) => {
  // Use provided start date or default to today
  if (!startDate) {
    startDate = new Date().toISOString().split('T')[0];
    console.log('No start date provided, using today as start date');
  } else {
    console.log(`Using provided start date: ${startDate}`);
  }
  
  const result = await database.getStats(period, startDate);
  console.log(`${period} stats result:`, result);
  return result;
});

ipcMain.handle('get-daily-stats', async (event, date) => {
  return await database.getDailyStats(date);
});


ipcMain.handle('clear-all-data', async (event) => {
  try {
    console.log('IPC: clear-all-data called');
    
    // Ensure database is initialized
    if (!database) {
      console.log('Database not initialized, initializing now...');
      database = new DatabaseManager();
      await database.initialize();
    }
    
    const result = await database.clearAllData();
    console.log('IPC: clear-all-data result:', result);
    return result;
  } catch (error) {
    console.error('IPC: Error in clear-all-data:', error);
    throw error;
  }
});

// Window control handlers
ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow.isMaximized();
});

// App event handlers
app.whenReady().then(async () => {
  await initializeDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (database) {
    database.close();
  }
});
