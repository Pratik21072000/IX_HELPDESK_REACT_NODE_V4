# TicketFlow - MERN Stack Application

A modern, production-ready ticket management system built with the MERN stack (MongoDB/SQLite, Express, React, Node.js) using JavaScript instead of TypeScript.

## Architecture

- **Backend**: Express.js with Sequelize ORM
- **Frontend**: React.js with React Router
- **Database**: SQLite (easily configurable to PostgreSQL/MySQL)
- **Authentication**: JWT tokens
- **UI**: Radix UI components with Tailwind CSS
- **Font**: Poppins applied globally

## Project Structure

```
├── server/                 # Express.js backend
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   ├── config/            # Database configuration
│   └── server.js          # Entry point
├── client/                # React.js frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Utilities
│   └── public/
└── package.json           # Root package for scripts
```

## Features

- **Role-based Access Control**: Different interfaces for Employees, Admins, HR, and Finance
- **Ticket Management**: Create, track, and manage tickets with priorities and departments
- **Dashboard**: Statistics and overviews for managers
- **Real-time UI**: Responsive design with modern components
- **Authentication**: Secure JWT-based authentication
- **Raw SQL Joins**: Using Sequelize for CRUD and raw SQL for complex queries

## Quick Start

### 1. Install Dependencies

```bash
npm run install-deps
```

### 2. Seed Database

```bash
cd server && npm run db:seed
```

### 3. Start Development Servers

```bash
npm run dev
```

This will start:

- Express server on port 5000
- React app on port 3000

## Test Credentials

| Username        | Password | Role            |
| --------------- | -------- | --------------- |
| admin           | password | Admin Manager   |
| hr_manager      | password | HR Manager      |
| finance_manager | password | Finance Manager |
| john_doe        | password | Employee        |
| jane_smith      | password | Employee        |

## API Routes

### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Tickets

- `GET /api/tickets` - Get tickets (filtered by role)
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `GET /api/tickets/:id` - Get single ticket

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

### Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## Database Schema

### Users

- id, username, password, name, role, department, timestamps

### Tickets

- id, subject, description, department, priority, status, category, subcategory, comment, createdBy, timestamps

## Environment Variables

Create `server/.env`:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=http://localhost:3000
```

## Development Commands

```bash
# Start both server and client
npm run dev

# Start server only
npm run server

# Start client only
npm run client

# Install all dependencies
npm run install-deps

# Seed database
cd server && npm run db:seed
```

## Key Changes from Next.js + TypeScript

1. **Architecture**: Converted from Next.js to separate Express + React apps
2. **Language**: All TypeScript files converted to JavaScript
3. **Database**: Prisma replaced with Sequelize ORM
4. **Authentication**: Adapted from Next.js cookies to JWT tokens
5. **Routing**: Next.js routing replaced with React Router
6. **API**: Next.js API routes converted to Express routes
7. **Raw Queries**: Complex joins use raw SQL while CRUD uses Sequelize

## Production Deployment

1. Build the React app: `cd client && npm run build`
2. Serve static files from Express
3. Configure environment variables
4. Use PostgreSQL/MySQL for production database
5. Implement proper error handling and logging

## Contributing

1. Follow the established JavaScript patterns
2. Use Sequelize for database operations
3. Maintain separation between client and server
4. Follow the existing component structure
5. Test with the provided demo credentials
