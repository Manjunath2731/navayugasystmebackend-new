# Navayuga Backend Server

A secure, industry-standard Node.js backend with MongoDB, Express, and TypeScript implementing RBAC (Role-Based Access Control).

## Features

- User authentication with JWT
- Industry-standard RBAC (Role-Based Access Control)
- Password hashing with Argon2
- File storage with AWS S3
- Email notifications with Nodemailer and EJS templates
- Security middleware (Helmet, CORS, Rate Limiting)
- Employee management system
- TypeScript support
- Zod validation
- Custom error handling
- Separation of concerns (controllers, services, middleware)
- Industry-standard project structure

## Roles

- Owner (Master User)
- Front Desk Employee
- Field Officer Employee

## Architecture

This backend follows industry-standard architecture patterns:

### Project Structure
```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── validation/      # Zod validation schemas
└── index.ts         # Application entry point
```

### Key Patterns Implemented

1. **Separation of Concerns**:
   - Controllers handle HTTP requests/responses
   - Services contain business logic
   - Middleware handles cross-cutting concerns
   - Models handle data persistence

2. **Error Handling**:
   - Custom error classes for different error types
   - Centralized error handling middleware
   - Operational vs Programming errors distinction

3. **Validation**:
   - Zod schema validation for all inputs
   - Request body and parameter validation
   - Automatic error responses for validation failures

4. **Security**:
   - JWT-based authentication
   - Role-based access control
   - Password hashing with Argon2
   - Security headers with Helmet
   - CORS configuration
   - Rate limiting

## Setup

### Option 1: Docker (Recommended)

1. Create a `.env` file in the server directory with your configuration:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your environment variables (AWS credentials, email settings, etc.)

2. Build and start the application with Docker Compose:
   ```bash
   docker-compose up -d
   ```

   This will:
   - Start MongoDB in a container
   - Build and start the Node.js application
   - Set up networking between containers
   - Persist MongoDB data in Docker volumes

3. View logs:
   ```bash
   docker-compose logs -f app
   ```

4. Stop the application:
   ```bash
   docker-compose down
   ```

5. Stop and remove volumes (⚠️ This will delete all data):
   ```bash
   docker-compose down -v
   ```

**Note:** MongoDB runs inside the Docker container and is only accessible from within the Docker network. The database data is persisted in Docker volumes.

### Option 2: Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example` and configure your environment variables

   **Email Configuration:**
   - For Gmail: Use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
   - Set `EMAIL_USER` to your Gmail address
   - Set `EMAIL_PASSWORD` to your App Password
   - For other email providers, adjust `EMAIL_HOST` and `EMAIL_PORT` accordingly

3. Make sure MongoDB is running locally or update `MONGO_URI` in `.env` to point to your MongoDB instance

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

For development:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)

### User Management (Owner only)
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Deactivate a user

## Security

- Passwords are hashed using Argon2
- JWT tokens for authentication
- Role-based access control
- Rate limiting to prevent abuse
- Helmet for HTTP security headers
- CORS configuration
- Input validation with Zod
- Custom error handling

## Industry Standards Implemented

1. **Error Handling**:
   - Custom error classes (`AppError`, `ValidationError`, etc.)
   - Centralized error handling middleware
   - Proper HTTP status codes
   - Consistent error response format

2. **Validation**:
   - Zod schema validation for all inputs
   - Automatic validation middleware
   - Clear validation error messages

3. **RBAC**:
   - Enhanced role-based access control middleware
   - Dashboard access permissions
   - Role-specific route protection

4. **Architecture**:
   - Service layer separation
   - Controller-service pattern
   - Middleware composition
   - Dependency injection through parameters

5. **Type Safety**:
   - TypeScript interfaces for all data structures
   - Strict type checking
   - Type-safe error handling

6. **Code Quality**:
   - Consistent naming conventions
   - Clear separation of concerns
   - Comprehensive error handling
   - Industry-standard project structure