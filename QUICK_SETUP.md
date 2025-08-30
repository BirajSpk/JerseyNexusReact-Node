# 🚀 JerseyNexus Quick Setup Guide

This guide will help you set up and connect the backend and frontend services.

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v14 or higher)
3. **Git** (for version control)

## 🛠️ Quick Setup Commands

### Step 1: Database Setup (PostgreSQL)

1. **Install PostgreSQL** (if not installed):
   - Download from: https://www.postgresql.org/download/windows/
   - Remember the password you set for the `postgres` user

2. **Create Database**:
   ```sql
   -- Open SQL Shell (psql) or pgAdmin
   CREATE DATABASE "ecommerce-project";
   ```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed

# Start the backend server
npm run dev
```

### Step 3: Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

## 🧪 Test Connection

After both servers are running, test the connection:

```bash
# In backend directory
npm run connection:test
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Database Admin**: http://localhost:5001/health/database

## 🔧 Troubleshooting

### ❌ Database Connection Failed

1. **Check if PostgreSQL is running**:
   ```bash
   # Windows
   sc query postgresql-x64-14
   ```

2. **Verify DATABASE_URL in backend/.env**:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ecommerce-project"
   ```

3. **Test database connection**:
   ```bash
   cd backend
   npm run db:check
   ```

### ❌ Frontend Can't Connect to Backend

1. **Check backend is running** on port 5001
2. **Verify VITE_API_URL in frontend/.env**:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

3. **Check CORS settings** in backend (should include localhost:3000)

### ❌ Port Already in Use

```bash
# Kill process on port 5001 (backend)
npx kill-port 5001

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

## 📱 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/ecommerce-project"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5001
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001/api
VITE_BACKEND_URL=http://localhost:5001
VITE_WS_URL=http://localhost:5001
```

## 🎯 Default Login Credentials

After seeding the database:
- **Email**: admin@jerseynexus.com
- **Password**: Admin123!@#

## 🔄 Development Workflow

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Test Connection**: `cd backend && npm run connection:test`
4. **View Database**: `cd backend && npm run db:studio`

## 📚 Additional Commands

```bash
# Reset database (⚠️ Deletes all data)
npm run db:reset

# Check database health
npm run db:check

# Generate new migration
npx prisma migrate dev --name your_migration_name

# View database in browser
npm run db:studio
```

## 🆘 Get Help

If you encounter issues:

1. **Check the logs** in your terminal
2. **Run connection test**: `npm run connection:test`
3. **Check database**: `npm run db:check`
4. **Verify environment files** exist and have correct values
5. **Ensure both servers are running** on correct ports

---

**Happy Development! 🎉**