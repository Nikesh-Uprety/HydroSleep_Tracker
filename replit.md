# HydroSleep Tracker

A health and habit tracking mobile app for monitoring sleep, water intake, and daily goals.

## Overview

HydroSleep Tracker is a React Native (Expo) mobile application that helps users track their:
- **Water Intake**: Daily water consumption with weekly visualization
- **Sleep**: Sleep duration and quality metrics (Rested %, REM %, Deep Sleep %)
- **Goals**: Customizable daily targets for exercise, water, sleep, and custom goals
- **Analytics**: Weekly insights with interactive charts
- **Profile**: User account management with profile image and settings

## Project Architecture

### Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT with bcrypt password hashing
- **Navigation**: React Navigation 7 (Bottom Tabs + Native Stack)
- **State Management**: React Context API with API service layer
- **Styling**: React Native StyleSheet with theme constants
- **Animations**: React Native Reanimated
- **Charts**: React Native SVG

### Folder Structure
```
├── App.tsx                 # Root app component with providers
├── context/
│   └── AppContext.tsx      # Global state management
├── navigation/
│   ├── AuthStackNavigator.tsx
│   ├── MainTabNavigator.tsx
│   ├── HomeStackNavigator.tsx
│   ├── WaterStackNavigator.tsx
│   ├── SleepStackNavigator.tsx
│   ├── GoalsStackNavigator.tsx
│   ├── AccountStackNavigator.tsx
│   └── screenOptions.ts
├── screens/
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── WaterReportScreen.tsx
│   ├── SleepReportScreen.tsx
│   ├── GoalsScreen.tsx
│   ├── AnalyticsScreen.tsx
│   └── AccountScreen.tsx
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── HeaderTitle.tsx
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   ├── ScreenScrollView.tsx
│   ├── ScreenKeyboardAwareScrollView.tsx
│   ├── ScreenFlatList.tsx
│   ├── ErrorBoundary.tsx
│   └── ErrorFallback.tsx
├── constants/
│   └── theme.ts            # Colors, spacing, typography
├── hooks/
│   ├── useTheme.ts
│   ├── useColorScheme.ts
│   └── useScreenInsets.ts
├── types/
│   └── navigation.ts       # TypeScript navigation types
└── assets/
    └── images/
        └── illustrations/  # App illustrations
```

## Features

### Authentication
- Login with email/password
- Sign up with name, email, password
- In-memory authentication (no persistent storage in prototype)

### Dashboard
- Personalized greeting showing user's display name
- Featured Analytics card at the top
- Navigation cards to Water, Sleep, Goals screens
- Quick stats overview

### Water Tracking
- Weekly bar chart visualization
- Quick add buttons (+250ml, +500ml, +750ml, +1000ml)
- "7 Day Goal Met!" celebration banner
- Health tips section

### Sleep Tracking
- Sleep duration display
- Sleep quality percentages (Rested, REM, Deep Sleep)
- Personalized suggestions
- Log new sleep entries

### Goals Management
- Three default goals (locked from deletion):
  - Exercise Regularly - times/week
  - Drink Water - L/day
  - Improve Sleep - hours/night
- Add custom goals with name, target value, and unit
- Delete custom goals (with confirmation)
- Tap to edit any goal's target value

### Analytics Dashboard
- Weekly Sleep chart (bar chart showing hours per day)
- Weekly Water Intake chart (bar chart with goal line)
- Goal Progress circle (weekly completion percentage)
- Stats showing total goals and daily completion

### Account/Profile
- Profile image (tap to change using device camera roll)
- Display name and email shown
- Edit Profile modal (change name and email)
- Change Password modal (with validation)
- Log Out button (with confirmation)

## Design Guidelines

- **Primary Color**: #2563EB (Blue)
- **Style**: Clean, minimal, iOS-style
- **Cards**: White with subtle shadows
- **Buttons**: Full-width, rounded corners
- **Typography**: System fonts

See `design_guidelines.md` for complete design specifications.

## Backend API

The app uses a REST API with MongoDB Atlas for persistent storage.

### API Endpoints
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/user/me` - Get current user profile
- `PUT /api/user/me` - Update profile
- `PUT /api/user/me/password` - Change password
- `PUT /api/user/me/avatar` - Update profile image
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create custom goal
- `PUT /api/goals/:id` - Update goal value
- `DELETE /api/goals/:id` - Delete custom goal
- `GET /api/water/today` - Get today's water intake
- `GET /api/water/week` - Get weekly water data
- `POST /api/water` - Add water intake
- `GET /api/sleep/latest` - Get latest sleep entry
- `GET /api/sleep/week` - Get weekly sleep data
- `POST /api/sleep` - Add sleep entry
- `GET /api/dashboard/summary` - Get dashboard data
- `GET /api/analytics/summary` - Get analytics data

## Running the App

```bash
npm run dev
```

The app runs on port 5000 for web preview. Scan the QR code with Expo Go to test on physical devices.

### Seeding Test Data

To populate the database with dummy users and data:
```bash
npm run seed
```

This creates 10 test users with water logs and sleep entries.

## Test Accounts

Password for all accounts: `password123`

| Email | Name |
|-------|------|
| alice@example.com | Alice Johnson |
| bob@example.com | Bob Smith |
| carol@example.com | Carol Davis |
| david@example.com | David Wilson |
| emma@example.com | Emma Brown |
| frank@example.com | Frank Miller |
| grace@example.com | Grace Lee |
| henry@example.com | Henry Taylor |
| ivy@example.com | Ivy Anderson |
| jack@example.com | Jack Thomas |

## Recent Changes

- **Nov 30, 2025**: Added database seed script with 10 dummy users
- **Nov 30, 2025**: Fixed proxy configuration for API routing
- **Nov 30, 2025**: Connected frontend to MongoDB Atlas backend
- **Nov 30, 2025**: Added Account/Profile screen with image picker, edit profile, change password, and logout
- **Nov 30, 2025**: Enhanced Goals with custom goal creation and deletion
- **Nov 30, 2025**: Added Analytics dashboard with sleep, water, and goal charts
- **Nov 30, 2025**: Updated navigation with Account tab and Analytics access
- **Nov 30, 2025**: Initial prototype implementation
