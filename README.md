# Nivora 💎

A modern React-based Progressive Web App for managing personal finance, life goals, and weekly tasks.

## Features

### 🏠 Dashboard
- Overview of your financial balance
- Quick view of active goals
- Recent weekly tasks summary
- Real-time statistics and progress tracking

### 💰 Finance Management
- Track income and expenses
- Categorize transactions
- View balance and financial summaries
- Add, view, and delete transactions
- Support for multiple transaction categories

### 🎯 Goals Tracking
- Create and prioritize life goals
- Set target amounts and track progress
- Update goal progress incrementally
- Filter goals by status (all/active/completed)
- Set deadlines and priorities (high/medium/low)

### ✓ Weekly Task Planner
- Create and manage weekly tasks
- Navigate between different weeks
- Track task status (pending/in-progress/completed)
- Set task priorities
- Weekly reflection notes
- Task completion tracking

### 🎨 Features
- ✨ Light and Dark theme support with smooth toggle
- 📱 Mobile-first, responsive design
- 🎴 Clean, minimal, card-based UI
- 🔄 Subtle animations and transitions
- 💾 LocalStorage for data persistence
- 📴 Progressive Web App (PWA) support - works offline

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
```bash
npm install
```

### Running the App

Start the development server:
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`

### Building for Production

Create an optimized production build:
```bash
npm run build
```

## Technology Stack

- **React 18** - UI library
- **CSS3** - Styling with CSS variables for theming
- **LocalStorage API** - Data persistence
- **Service Workers** - PWA functionality
- **React Hooks** - State management

## Project Structure

```
Nivora/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── service-worker.js
│   └── icons/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Finance/
│   │   ├── Goals/
│   │   └── Tasks/
│   ├── context/
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   └── useLocalStorage.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.jsx
│   └── index.css
└── package.json
```

## Usage Guide

### Theme Toggle
Click the theme toggle button (🌙/☀️) in the header to switch between light and dark modes.

### Managing Finances
1. Click "+ Add Transaction" button
2. Select income or expense type
3. Enter amount, category, and description
4. Transactions are automatically saved to LocalStorage

### Creating Goals
1. Click "+ New Goal" button
2. Fill in goal details (title, target amount, priority)
3. Update progress as you save money towards your goal
4. Mark as complete when achieved

### Planning Tasks
1. Navigate to different weeks using arrow buttons
2. Click "+ New Task" to create a task
3. Update task status by checking the checkbox or using action buttons
4. Add weekly reflections in the text area at the bottom

## Data Persistence

All data is stored locally in your browser's LocalStorage:
- `nivora-finances` - Financial transactions
- `nivora-goals` - Life goals
- `nivora-tasks` - Weekly tasks
- `nivora-theme` - Theme preference
- `nivora-reflections` - Weekly reflections

## Browser Support

Nivora works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## PWA Features

Nivora can be installed as a Progressive Web App:
1. Click the install prompt in your browser
2. Or use "Add to Home Screen" on mobile
3. Access the app offline after installation

## License

MIT License - See LICENSE file for details

## Author

Created with ❤️ for better personal management
Nivora is designed to help individuals organize their life with clarity and intention. It brings personal finance, life goals, and weekly task planning into one unified system.
