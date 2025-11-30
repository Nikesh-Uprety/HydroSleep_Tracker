# HydroSleep Tracker

A health and habit tracking mobile app for monitoring sleep, water intake, and daily goals.

## Overview

HydroSleep Tracker is a React Native (Expo) mobile application that helps users track their:
- **Water Intake**: Daily water consumption with weekly visualization
- **Sleep**: Sleep duration and quality metrics (Rested %, REM %, Deep Sleep %)
- **Goals**: Customizable daily targets for exercise, water, and sleep

## Project Architecture

### Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **Navigation**: React Navigation 7 (Bottom Tabs + Native Stack)
- **State Management**: React Context API
- **Styling**: React Native StyleSheet with theme constants
- **Animations**: React Native Reanimated

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
│   └── screenOptions.ts
├── screens/
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── WaterReportScreen.tsx
│   ├── SleepReportScreen.tsx
│   └── GoalsScreen.tsx
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
- Personalized greeting
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
- Exercise: times per week
- Water: liters per day
- Sleep: hours per night
- Tap to edit any goal

## Design Guidelines

- **Primary Color**: #2563EB (Blue)
- **Style**: Clean, minimal, iOS-style
- **Cards**: White with subtle shadows
- **Buttons**: Full-width, rounded corners
- **Typography**: System fonts

See `design_guidelines.md` for complete design specifications.

## Running the App

```bash
npm run dev
```

The app runs on port 5000 for web preview. Scan the QR code with Expo Go to test on physical devices.

## Recent Changes

- Initial prototype implementation (Nov 30, 2025)
- Added all core screens and navigation
- Implemented in-memory state management
- Created responsive UI matching mockup design
