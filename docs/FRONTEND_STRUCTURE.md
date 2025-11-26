# Focus Flow Frontend - Codebase Structure Documentation

This document provides a comprehensive overview of the Focus Flow frontend codebase structure, patterns, and conventions. Use this as a reference when setting up a new frontend project based on this architecture.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Key Patterns & Conventions](#key-patterns--conventions)
5. [Configuration Files](#configuration-files)
6. [Development Workflow](#development-workflow)
7. [Architecture Patterns](#architecture-patterns)

---

## Project Overview

**Focus Flow** is a Vue.js 3 frontend application for productivity and focus management. It features:
- Task management with status tracking
- Emotion logging and analysis
- Gamified accountability through bets
- Real-time notifications via Server-Sent Events (SSE)
- User authentication with JWT tokens

---

## Technology Stack

### Core Dependencies
- **Vue 3.4.0+** - Progressive JavaScript framework (Composition API)
- **Vue Router 4.2.5+** - Client-side routing
- **Pinia 2.1.7+** - State management (Vue's official store library)

### Development Tools
- **Vite 5.0.10+** - Build tool and dev server
- **TypeScript 5.3.3+** - Type safety
- **Vue TSC 2.0.0+** - TypeScript checking for Vue files
- **@vitejs/plugin-vue 4.5.2+** - Vue SFC support for Vite

### Node Version
- **Node.js 20.x** (specified in package.json engines)

---

## Project Structure

```
focus-flow-frontend/
├── index.html               # Entry HTML file
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # TypeScript config for Node tools
├── public/                  # Static assets
│   └── vite.svg
├── src/
│   ├── main.ts              # Application entry point
│   ├── App.vue              # Root component
│   ├── style.css            # Global styles
│   ├── vite-env.d.ts        # Vite type definitions
│   │
│   ├── api/                 # API client layer
│   │   ├── auth.ts          # Authentication API calls
│   │   ├── tasks.ts         # Task management API calls
│   │   ├── bets.ts          # Betting API calls
│   │   ├── emotions.ts      # Emotion logging API calls
│   │   └── nudges.ts        # Nudge notification API calls
│   │
│   ├── components/          # Vue components
│   │   ├── auth/            # Authentication components
│   │   │   ├── LoginForm.vue
│   │   │   ├── RegisterForm.vue
│   │   │   └── AccountSettings.vue
│   │   │
│   │   ├── base/            # Reusable base components
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseCard.vue
│   │   │   ├── BaseInput.vue
│   │   │   ├── BaseConfirmModal.vue
│   │   │   ├── index.ts     # Barrel export
│   │   │   └── README.md
│   │   │
│   │   ├── bets/            # Betting feature components
│   │   │   ├── BetsDashboard.vue
│   │   │   ├── BetForm.vue
│   │   │   ├── BetList.vue
│   │   │   ├── BetItem.vue
│   │   │   ├── BetHistory.vue
│   │   │   └── BetStats.vue
│   │   │
│   │   ├── emotions/        # Emotion tracking components
│   │   │   ├── EmotionsDashboard.vue
│   │   │   ├── EmotionForm.vue
│   │   │   ├── EmotionAnalysis.vue
│   │   │   ├── EmotionStats.vue
│   │   │   └── EmotionPromptModal.vue
│   │   │
│   │   ├── layout/          # Layout components
│   │   │   ├── DashboardLayout.vue
│   │   │   └── AppNavigation.vue
│   │   │
│   │   ├── nudges/          # Notification components
│   │   │   └── NudgeNotification.vue
│   │   │
│   │   └── tasks/           # Task management components
│   │       ├── TasksDashboard.vue
│   │       ├── TaskCreationFlow.vue
│   │       ├── TaskForm.vue
│   │       ├── TaskList.vue
│   │       └── TaskItem.vue
│   │
│   ├── composables/         # Vue composables (reusable logic)
│   │   └── useDesignTokens.ts
│   │
│   ├── constants/           # Application constants
│   │   ├── design.ts        # Design system tokens
│   │   ├── emotions.ts      # Emotion-related constants
│   │   └── index.ts         # Barrel export
│   │
│   ├── router/              # Vue Router configuration
│   │   └── index.ts         # Route definitions and guards
│   │
│   └── stores/              # Pinia stores (state management)
│       ├── authStore.ts     # Authentication state
│       ├── taskStore.ts     # Task management state
│       ├── betStore.ts      # Betting state
│       ├── emotionStore.ts  # Emotion tracking state
│       └── nudgeStore.ts    # Notification state
```

---

## Key Patterns & Conventions

### 1. **Component Organization**

Components are organized by feature/domain:
- **`base/`** - Reusable, generic UI components (buttons, inputs, cards, modals)
- **`auth/`** - Authentication-related components
- **`tasks/`**, **`bets/`**, **`emotions/`** - Feature-specific components
- **`layout/`** - Layout and navigation components
- **`nudges/`** - Real-time notification components

**Naming Convention:**
- Components use PascalCase: `BaseButton.vue`, `TasksDashboard.vue`
- Feature components are grouped in folders matching the feature name

### 2. **API Layer Pattern**

All API calls are centralized in the `src/api/` directory:
- Each file corresponds to a backend service/domain
- Functions are exported as named exports
- Consistent error handling via `handleResponse<T>()` helper
- TypeScript interfaces defined at the top of each file
- Base URL configured via environment variable or default

**Example Structure:**
```typescript
// src/api/tasks.ts
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

export interface Task { ... }
export interface CreateTaskRequest { ... }

async function handleResponse<T>(response: Response): Promise<T> { ... }

export async function createTask(...): Promise<...> { ... }
export async function getTasks(...): Promise<...> { ... }
```

### 3. **State Management (Pinia)**

Stores follow a consistent pattern:
- **Setup Store** using `defineStore()` with Composition API syntax
- **State**: Reactive refs for data
- **Getters**: Computed properties for derived state
- **Actions**: Async functions for API calls and state mutations
- **Initialization**: `initialize()` method called on app startup
- **Cleanup**: Methods to clear state on logout

**Store Structure:**
```typescript
export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const pendingTasks = computed(() => { ... })
  
  // Actions
  async function fetchTasks() { ... }
  async function addTask() { ... }
  async function initialize() { ... }
  function clearTasks() { ... }
  
  return { tasks, isLoading, error, pendingTasks, fetchTasks, ... }
})
```

### 4. **Design System**

Centralized design tokens in `src/constants/design.ts`:
- **Colors**: Primary, secondary, semantic, status, theme colors
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, xxl, xxxl)
- **Typography**: Font families, sizes, weights, line heights
- **Border Radius**: Standardized border radius values
- **Shadows**: Elevation shadow definitions
- **Transitions**: Animation timing constants
- **Breakpoints**: Responsive design breakpoints
- **Z-Index**: Layering system

**Usage via Composable:**
```typescript
// In components
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()
// Apply via :style="cssVars" in template
```

CSS variables are automatically generated and can be used in scoped styles:
```css
.my-component {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}
```

### 5. **Routing Pattern**

Routes are defined in `src/router/index.ts`:
- Lazy-loaded components using dynamic imports
- Route meta for authentication requirements
- Navigation guards for auth protection
- TypeScript module augmentation for route meta

**Route Definition:**
```typescript
{
  path: '/tasks',
  name: 'Tasks',
  component: () => import('../components/tasks/TasksDashboard.vue'),
  meta: { requiresAuth: true }
}
```

**Navigation Guard:**
- Checks `requiresAuth` meta and redirects to login if needed
- Checks `requiresGuest` meta and redirects to dashboard if authenticated

### 6. **Authentication Flow**

1. **Initialization**: `authStore.initialize()` loads tokens from localStorage on app startup
2. **Login/Register**: Stores tokens, fetches user info, initializes other stores
3. **Auto-refresh**: Access token refreshed every 14 minutes automatically
4. **SSE Connection**: Unified Server-Sent Events connection for real-time updates
5. **Logout**: Clears all state, closes SSE, removes tokens from localStorage

**Token Storage:**
- `accessToken` and `refreshToken` stored in localStorage
- User info (userId, username, email) also persisted
- Tokens included in API request bodies (not headers)

### 7. **Base Components Pattern**

Reusable components in `src/components/base/`:
- **BaseButton**: Standardized button with variants (primary, secondary, danger, ghost)
- **BaseCard**: Container component with consistent styling
- **BaseInput**: Form input with validation states
- **BaseConfirmModal**: Reusable confirmation dialog

All base components:
- Use design tokens via `useDesignTokens()` composable
- Support variants via props
- Export via `index.ts` barrel file

### 8. **TypeScript Conventions**

- **Strict mode enabled** in tsconfig.json
- **Path aliases**: `@/*` maps to `src/*`
- **Type definitions**: Interfaces exported from API files
- **Module augmentation**: Used for Vue Router meta types
- **Type re-exports**: Store types re-exported for convenience

---

## Configuration Files

### `vite.config.ts`
- Vue plugin configuration
- Path alias: `@` → `./src`
- Proxy configuration for `/api` → `http://localhost:8000`
- Build target: ES2022 (supports top-level await)

### `tsconfig.json`
- Target: ES2022
- Module: ESNext
- Strict mode enabled
- Path mapping: `@/*` → `src/*`
- Includes: `src/**/*.ts`, `src/**/*.vue`

### `package.json`
- Scripts:
  - `dev`: Start Vite dev server
  - `build`: Type check + production build
  - `preview`: Preview production build
  - `type-check`: TypeScript type checking only
- Node version: 20.x

### `index.html`
- Entry point with meta tags
- Theme color: `#BB86FC`
- Script entry: `/src/main.ts`

---

## Development Workflow

### Initial Setup
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Backend should be running on `http://localhost:8000`

### Environment Variables
- `VITE_API_BASE_URL`: Override API base URL (defaults to `/api`)
- For SSE connections, uses full URL: `http://localhost:8000/api` (or env var)

### Build Process
1. Type checking: `vue-tsc --noEmit`
2. Production build: `vite build`
3. Output: `dist/` directory

### Type Checking
- Run separately: `npm run type-check`
- Integrated into build process

---

## Architecture Patterns

### 1. **Separation of Concerns**

- **API Layer** (`src/api/`): Pure HTTP client functions, no business logic
- **Store Layer** (`src/stores/`): Business logic, state management, API orchestration
- **Component Layer** (`src/components/`): UI presentation, user interactions
- **Router Layer** (`src/router/`): Navigation, route guards, lazy loading

### 2. **Dependency Flow**

```
Components → Stores → API → Backend
     ↓         ↓
  Router    Pinia
```

- Components call store actions
- Stores call API functions
- API functions make HTTP requests
- Router handles navigation and guards

### 3. **State Initialization Flow**

```
main.ts
  ├── Create Pinia instance
  ├── Initialize authStore (from localStorage)
  ├── Use router
  ├── Initialize feature stores (if authenticated)
  └── Mount app
```

### 4. **Real-time Updates**

- **Server-Sent Events (SSE)**: Unified connection in `authStore`
- **Event Types**: `nudge`, `bet_resolved`, `bet_expired`, `heartbeat`
- **Auto-reconnection**: Reconnects on auth actions
- **Event Routing**: Events routed to appropriate stores

### 5. **Error Handling**

- **API Layer**: Throws errors with messages
- **Store Layer**: Catches errors, sets error state, re-throws for UI
- **Component Layer**: Displays errors to user, handles loading states

### 6. **Authentication Flow**

```
User Action → Store Action → API Call → Backend
                              ↓
                         Store Token
                              ↓
                    Initialize Feature Stores
                              ↓
                    Start SSE Connection
                              ↓
                    Start Auto-refresh Timer
```

### 7. **Component Communication**

- **Parent → Child**: Props
- **Child → Parent**: Events (`emit`)
- **Sibling/Global**: Pinia stores
- **Route Data**: Router params/query

### 8. **Styling Approach**

- **Global Styles**: `src/style.css` (reset, base styles)
- **Design Tokens**: CSS variables via `useDesignTokens()` composable
- **Component Styles**: Scoped styles in `<style scoped>`
- **Design System**: Centralized constants in `src/constants/design.ts`

---

## Key Files Reference

### Entry Points
- `index.html` - HTML entry
- `src/main.ts` - JavaScript entry, app initialization
- `src/App.vue` - Root Vue component

### Core Configuration
- `vite.config.ts` - Build tool configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

### Routing
- `src/router/index.ts` - All route definitions and guards

### State Management
- `src/stores/authStore.ts` - Authentication, tokens, SSE
- `src/stores/taskStore.ts` - Task CRUD operations
- `src/stores/betStore.ts` - Betting functionality
- `src/stores/emotionStore.ts` - Emotion logging
- `src/stores/nudgeStore.ts` - Notification handling

### API Layer
- `src/api/auth.ts` - Authentication endpoints
- `src/api/tasks.ts` - Task management endpoints
- `src/api/bets.ts` - Betting endpoints
- `src/api/emotions.ts` - Emotion logging endpoints
- `src/api/nudges.ts` - Nudge notification endpoints

### Design System
- `src/constants/design.ts` - Design tokens
- `src/composables/useDesignTokens.ts` - CSS variable generator

---

## Best Practices

1. **Always use TypeScript** - Type safety throughout
2. **Use stores for shared state** - Avoid prop drilling
3. **Lazy load routes** - Use dynamic imports for route components
4. **Design tokens** - Use CSS variables from design system
5. **Error handling** - Handle errors at store level, display at component level
6. **Loading states** - Track loading in stores, show in components
7. **Authentication checks** - Use route meta and guards
8. **API consistency** - Follow the pattern in existing API files
9. **Component composition** - Break down complex components
10. **Scoped styles** - Use `<style scoped>` to avoid style conflicts

---

## Setting Up a New Frontend

### Step 1: Project Setup
```bash
npm create vite@latest my-app -- --template vue-ts
cd my-app
npm install vue-router@^4.2.5 pinia@^2.1.7
```

### Step 2: Directory Structure
Create the directory structure as outlined above:
- `src/api/` - API client functions
- `src/components/` - Vue components (organized by feature)
- `src/stores/` - Pinia stores
- `src/router/` - Vue Router configuration
- `src/constants/` - Application constants
- `src/composables/` - Reusable composables

### Step 3: Configuration
- Set up `vite.config.ts` with path aliases and proxy
- Configure `tsconfig.json` with path mapping
- Set up design tokens in `src/constants/design.ts`
- Create `useDesignTokens` composable

### Step 4: Core Setup
- Create `src/main.ts` with Pinia and Router setup
- Set up authentication store with token management
- Configure router with guards
- Create base components

### Step 5: Feature Development
- Create API client functions for each backend service
- Create Pinia stores for each feature domain
- Build components following the established patterns
- Add routes for each feature

---

## Notes

- **Backend API**: Assumes RESTful API with POST requests (access token in body)
- **Authentication**: JWT-based with access/refresh token pattern
- **Real-time**: Uses Server-Sent Events (SSE) for notifications
- **Theme**: Dark theme with Material Design-inspired colors
- **Responsive**: Mobile-first approach with breakpoints defined in design tokens

---

This structure provides a scalable, maintainable foundation for a Vue 3 frontend application with TypeScript, Pinia, and Vue Router.

