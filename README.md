# 🍽️ Meal Tracker Desktop App

A modern desktop application built with Electron and React to help you track your daily meals and build healthy eating habits.

## Features

- **Daily Meal Tracking**: Track breakfast, lunch, and dinner with one-click completion
- **Modern UI**: Clean, responsive interface with dark/light mode toggle
- **Statistics Dashboard**: View daily, weekly, and monthly progress
- **Data Persistence**: Local SQLite database stores all your meal data
- **Portable**: Single .exe file, no installation required

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To run the app in development mode:
```bash
npm run dev
```

This will start both the React development server and Electron.

### Building for Production

To build the app as a standalone .exe file:
```bash
npm run dist
```

The executable will be created in the `dist` folder.

## Usage

1. **Track Meals**: Click "Mark as Complete" on each meal card when you finish eating
2. **Navigate Dates**: Use the date navigator to view past or future days
3. **View Statistics**: Switch to the Statistics tab to see your progress
4. **Dark Mode**: Toggle between light and dark themes using the sun/moon icon

## Technology Stack

- **Frontend**: React 18 with Tailwind CSS
- **Desktop**: Electron
- **Database**: SQLite3
- **Icons**: Lucide React
- **Build**: Electron Builder

## Project Structure

```
src/
├── main/           # Electron main process
│   ├── main.js     # Main Electron process
│   ├── preload.js  # Preload script for security
│   └── database.js # SQLite database management
└── renderer/       # React frontend
    ├── components/ # UI components
    ├── App.js      # Main React app
    └── index.js    # React entry point
```

## License

MIT License - feel free to use and modify as needed!
