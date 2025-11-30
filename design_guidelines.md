# HydroSleep Tracker - Design Guidelines

## Design Philosophy
Clean, minimal, iOS-style health tracking application focused on simplicity and clarity. The interface should feel friendly, encouraging, and non-intimidating to promote daily health habit tracking.

---

## Visual Design System

### Color Palette
- **Primary Color**: Mid/bright blue (#2563EB or similar)
  - Use for primary buttons, active tabs, goal values, and key CTAs
- **Background**: White (#FFFFFF)
- **Cards**: White with subtle shadows for depth
- **Text**: System default (dark for primary, gray for secondary)

### Typography
- Use system fonts (San Francisco on iOS, Roboto on Android)
- No custom paid fonts required
- Hierarchy:
  - Screen titles: Large, bold
  - Subtitles/greetings: Medium, regular weight
  - Body text: Regular size, regular weight
  - Numeric values: Bold or semi-bold for emphasis

### Visual Elements
- **Rounded Corners**: Apply to all buttons and cards for a friendly aesthetic
- **Illustrations**: Use simple, friendly vector illustrations
  - Welcome screen: Person with large glass of water
  - Sleep cards: Person sleeping peacefully
  - Sleep report: Medal/ribbon badge for achievements
- **Icons**: System icons or simple custom icons, left-aligned in cards with right chevron arrows
- **Safe Areas**: Respect safe areas on modern devices (notches, home indicators)

---

## Navigation Architecture

### Root Navigation: Bottom Tab Bar
**4 Tabs (always visible):**
1. **Home** (Dashboard)
2. **Water**
3. **Sleep**
4. **Goals**

### Authentication Stack (Conditional)
- Shown when no valid token exists
- Screens: Login → Sign Up
- After successful auth → switch to App Stack

---

## Screen Specifications

### 1. Login / Welcome Screen
**Purpose**: User authentication entry point

**Layout**:
- Large illustration at top (person with water glass)
- Title: "Welcome Back!" (centered, large)
- Form fields (stacked vertically):
  - Email input (text)
  - Password input (secured)
- Primary button: "Log In" (full-width, blue, rounded)
- Footer text: "Don't have an account? Sign Up" (Sign Up is tappable link)

**Interaction**:
- On successful login → navigate to Dashboard
- "Sign Up" link → navigate to Sign Up screen

---

### 2. Sign Up Screen
**Layout**:
- Similar structure to Login
- Form fields:
  - Name (text)
  - Email (text)
  - Password (secured)
  - Confirm Password (secured)
- Primary button: "Sign Up" (full-width, blue, rounded)
- Footer text: "Already have an account? Log In"

---

### 3. Dashboard Screen
**Purpose**: Central hub showing overview of all tracking categories

**Header**:
- Title: "Dashboard"
- Subtitle: "Hello, [UserName]" (personalized greeting)

**Main Content** (vertical scrollable list):
Four navigation cards:
1. "Water Intake – Awesome Efforts"
2. "Sleep Tracker"
3. "Sleep Report"
4. "Goals"

**Card Design**:
- White rounded rectangle
- Small icon/illustration on left
- Right arrow chevron on right
- Tappable to navigate to respective screens

**Bottom**: Tab bar always visible

---

### 4. Sleep Report Screen (Simple Tracker)
**Purpose**: Quick view of last night's sleep with tracking control

**Layout**:
- Title: "Sleep Report"
- Subtitle: "Last Night"
- Large centered card:
  - Illustration of sleeping person
  - Large time display: "7h 55m" (bold, prominent)
  - Subtext: "Didn't move in bed" (contextual message)
  - Button at bottom: "Stop Tracking" (blue, rounded, full-width within card)

---

### 5. Sleep Report Screen (Detailed)
**Purpose**: Comprehensive sleep quality breakdown

**Layout**:
- Title: "Sleep Report – Last Night"
- Top badge: Medal/ribbon illustration
- Main stat: "Great Job! 8h 05m"
- Three circular stats (horizontal row):
  - "90% – Rested"
  - "25% – REM"
  - "20% – Deep Sleep"
- Suggestions section below:
  - Title: "Suggestions"
  - Body text: "A consistent sleep schedule helps your body recover." (example)

---

### 6. Water Report Screen
**Purpose**: Weekly water intake visualization and goal tracking

**Header**:
- Title: "Water Report"
- Subtitle: "Week of [date]"
- Banner: "7 Day Goal Met!" (conditional, shown when goal achieved) or "Keep Going"

**Main Content**:
- 7-bar chart visualization:
  - Each bar represents one day of the week
  - Height represents water consumed vs. daily goal
  - Simple implementation using Views (no complex chart library)
- Tips section below:
  - Example: "The more you drink regularly, the better your hydration."

**Action**: Include button/method to log new water intake (e.g., +250ml, +500ml quick actions)

---

### 7. Goals Screen
**Purpose**: View and manage daily health goals

**Header**:
- Title: "Goals"
- Subtitle: "Daily"

**Main Content** (list):
Three goal rows:
1. "Exercise Regularly – 4x"
2. "Drink Water – 3L"
3. "Improve Sleep – 8h"

**Row Design**:
- Goal label on left (regular text)
- Numeric value with unit on right (blue, bold)
- Each row tappable

**Interaction**:
- Tap row → open modal or secondary screen to edit goal value
- Simple numeric input for adjusting targets

---

## Component Patterns

### Buttons
- **Primary Action**: Full-width, blue background (#2563EB), white text, rounded corners
- **Secondary Action**: Outlined or text-only as needed
- Visual feedback on press (subtle opacity change or scale)

### Cards
- White background
- Subtle shadow for depth (but not heavy drop shadows)
- Rounded corners (8-12px radius)
- Padding: comfortable spacing around content
- Tappable cards should have subtle press feedback

### Form Inputs
- Clean text inputs with bottom border or subtle outline
- Placeholder text in gray
- Error states with red border and error message below
- Sufficient tap target size (minimum 44x44 points)

### Modals
- Used for quick actions (edit goals, log water/sleep)
- Centered or bottom sheet style
- Backdrop with slight transparency
- Clear dismiss action (X button, Cancel button, or tap outside)

---

## Interaction Design

### Feedback
- Show loading states during API calls
- Display friendly error toasts/alerts on failures
- Success confirmations for actions (logged water, saved goal)
- Input validation with inline error messages

### Data Entry
- **Sleep Logging**: Modal with time inputs or duration fields
- **Water Logging**: Quick action buttons (+250ml, +500ml) or custom amount input
- **Goal Editing**: Simple numeric keyboard input for values

### Navigation
- Tab bar always accessible for quick context switching
- Back button (iOS chevron) for drill-down screens
- Smooth transitions between screens

---

## Accessibility
- Sufficient color contrast for text readability
- Tap targets meet minimum size (44x44 points)
- Clear visual hierarchy
- Support for dynamic type sizes
- Meaningful labels for screen readers

---

## Data Visualization
- **Bar Charts**: Simple, clean bars showing water intake
  - Use consistent spacing between bars
  - Clear axis labels (days of week)
  - Visual indicator when goal is met (highlighted bars or banner)
- **Stats Display**: Large, readable numbers with units
- **Percentages**: Circular badges or progress indicators for sleep quality metrics

---

## Content & Messaging
- **Tone**: Encouraging, positive, supportive
- **Greeting**: Personalized with user's name
- **Achievements**: Celebrate successes ("Great Job!", "7 Day Goal Met!")
- **Suggestions**: Helpful, non-judgmental health tips
- **Error Messages**: Clear, actionable, friendly