# Development Setup Commands

## Initial Setup

```bash
# Install root dependencies
npm run install-deps

# Seed the database
cd server && npm run db:seed

# Start both server and client
npm run dev
```

## Individual Commands

```bash
# Start server only (port 5000)
npm run server

# Start client only (port 3000)
npm run client

# Start both simultaneously
npm run dev
```

## Database

```bash
# Seed the database with sample data
cd server && npm run db:seed
```

## Test Credentials

- Admin: admin / password
- HR Manager: hr_manager / password
- Finance Manager: finance_manager / password
- Employee: john_doe / password
- Employee: jane_smith / password
