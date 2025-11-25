# Navayuga Dashboard

A React dashboard with role-based access control (RBAC) built with Vite, TypeScript, and Tailwind CSS.

## Features

- Role-based dashboards (Owner, Front Desk, Field Officer)
- Authentication system with login/logout
- Responsive design with mobile-friendly sidebar
- Protected routes based on user roles
- Clean and modern UI with Tailwind CSS

## Roles

- Owner Dashboard: Employee Management System
- Front Desk Dashboard: Customer management and appointments
- Field Officer Dashboard: Field visits and task management

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/     # Reusable components
├── context/        # React context for authentication
├── pages/          # Page components for different routes
├── hooks/          # Custom hooks
├── utils/          # Utility functions
└── types/          # TypeScript types
```

## Available Routes

- `/login` - Login page
- `/dashboard` - Main dashboard (redirects to role-specific dashboard)
- `/dashboard/ems` - Employee Management System (Owner only)
- `/dashboard/customers` - Customer management (Front Desk)
- `/dashboard/visits` - Field visits (Field Officer)
- And more coming soon...

## Development

The dashboard is built with:
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management

To add new features:
1. Create new components in the appropriate directories
2. Add new routes in App.tsx
3. Update navigation in Sidebar.tsx if needed