
# GEMINI.md

## Project Overview

This project is a React-based web application for managing wash, receive, and delivery transactions. It is built with Vite, uses Material-UI for UI components, and is configured as a hybrid mobile application using Capacitor. The application features role-based access control for "Admin" and "User" roles, with distinct functionalities for each.

The project structure is well-organized, with a clear separation of concerns:
- `src/api`: Handles all API interactions with the backend.
- `src/components`: Contains reusable React components for different parts of the application.
- `src/context`: Manages global state, such as authentication.
- `src/hooks`: Provides custom hooks for reusing component logic.
- `src/utils`: Contains utility functions and constants.

## Building and Running

### Prerequisites

- Node.js and npm (or yarn) must be installed.

### Installation

To install the project dependencies, run:
```bash
npm install
```

### Running the Development Server

To run the application in development mode, use:
```bash
npm run dev
```
This will start the Vite development server, and the application will be accessible at `http://localhost:5173`.

### Building for Production

To build the application for production, run:
```bash
npm run build
```
The production-ready files will be generated in the `dist` directory.

### Linting

To check the code for linting errors, run:
```bash
npm run lint
```

## Development Conventions

### Coding Style

- The project uses ESLint for code linting. The configuration can be found in `eslint.config.js`.
- It follows standard React and JavaScript best practices.

### API Interaction

- API requests are managed using `axios`.
- The base configuration for `axios` is in `src/api/axiosConfig.js`. This includes the API base URL and interceptors for handling authentication tokens.
- API endpoints are defined in separate files within the `src/api` directory (e.g., `authApi.js`, `workOrderApi.js`).

### State Management

- Global authentication state is managed using React Context, as seen in `src/context/AuthProvider.jsx`.
- Component-level state is managed using React hooks (`useState`, `useEffect`, etc.).

### Routing

- The application uses `react-router-dom` for routing.
- Routes are defined in `src/App.jsx` and are protected based on user roles ("Admin" or "User").

### Form Handling and Validation

- Forms are built using `react-hook-form`.
- Schema-based validation is handled with `yup`.
