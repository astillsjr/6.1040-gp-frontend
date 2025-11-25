# LocalLoop Frontend

Vue.js frontend for LocalLoop - MIT's Community Resource Sharing Platform.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Project Structure

```
src/
  ├── components/       # Reusable Vue components
  │   └── NavBar.vue
  ├── views/           # Page components
  │   ├── HomeView.vue
  │   ├── LoginView.vue
  │   ├── RegisterView.vue
  │   ├── ProfileView.vue
  │   ├── ItemsView.vue
  │   └── NewItemView.vue
  ├── services/        # API and business logic
  │   ├── api.js      # Axios instance and API endpoints
  │   └── auth.js     # Authentication service
  ├── router/          # Vue Router configuration
  │   └── index.js
  ├── utils/           # Utility functions
  │   ├── jwt.js      # JWT token helpers
  │   └── validDorms.js
  ├── App.vue          # Root component
  ├── main.js          # Application entry point
  └── style.css        # Global styles
```

## Features

- **Authentication**: Login, register, and session management with JWT tokens
- **User Profile**: Create and update user profiles with dorm information
- **Item Listing**: Browse and list items for borrowing
- **Protected Routes**: Route guards for authenticated pages

## API Integration

The frontend communicates with the backend API at the base URL configured in `.env`. The API follows a concept-based architecture where each feature is a separate concept:

- `UserAuthentication` - User registration, login, logout
- `UserProfile` - User profile management
- `ItemListing` - Item browsing and creation
- And more concepts as the project evolves

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Development Notes

- The app uses Vue 3 with Composition API
- Vue Router handles navigation and route guards
- Axios is used for HTTP requests with automatic token refresh
- JWT tokens are stored in localStorage (accessToken and refreshToken)
- The API automatically attaches the access token to authenticated requests
- On 401 errors, the app attempts to refresh the access token automatically

## Backend Requirements

Make sure the backend server is running at `http://localhost:8000` (or your configured URL). The backend should have:

- MongoDB database connection
- All concept endpoints available at `/api/{ConceptName}/{actionName}`
- JWT authentication enabled

See the [backend repository](https://github.com/astillsjr/6.1040-gp-backend) for more details.