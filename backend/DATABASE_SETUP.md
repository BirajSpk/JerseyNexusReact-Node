# PostgreSQL Database Setup Checker

This guide helps you verify that your PostgreSQL database is properly configured for JerseyNexus.

## 🚀 Quick Start

### Method 1: Run the Database Check Script
```bash
# Navigate to the backend directory
cd backend

# Run the database checker
npm run db:check
```

### Method 2: Check via API Endpoint
```bash
# Start your server
npm run dev

# In another terminal, check database health
curl http://localhost:5001/health/database
```

### Method 3: Manual Script Execution
```bash
# Run the checker script directly
node scripts/checkDatabase.js
```

## 📋 What the Checker Verifies

### ✅ Connection Test
- Tests if the application can connect to PostgreSQL
- Validates DATABASE_URL configuration
- Confirms server is running and accessible

### ✅ Database Type Verification
- Confirms you're using PostgreSQL (not SQLite or other databases)
- Shows PostgreSQL version information
- Validates database compatibility

### ✅ Table Structure Check
- Verifies all required tables exist:
  - User, Product, Category, Order, OrderItem
  - Review, Blog, Payment, Image
- Shows missing tables if any
- Lists all existing tables

### ✅ Permission Testing
- Tests READ permissions (SELECT queries)
- Tests WRITE permissions (INSERT operations)
- Tests UPDATE permissions (UPDATE queries)
- Tests DELETE permissions (DELETE operations)

## 🔧 Common Issues & Solutions

### ❌ Connection Failed
**Problem**: Cannot connect to PostgreSQL database
**Solutions**:
1. Check if PostgreSQL is running: `brew services start postgresql` (Mac) or `sudo service postgresql start` (Linux)
2. Verify DATABASE_URL in `.env` file
3. Confirm database exists: `createdb ecommerce-project`
4. Check credentials and permissions

### ❌ Not PostgreSQL
**Problem**: Database is not PostgreSQL
**Solutions**:
1. Update DATABASE_URL to point to PostgreSQL
2. Change from SQLite: Replace `file:./prisma/dev.db` with PostgreSQL URL
3. Install PostgreSQL if not installed

### ❌ Missing Tables
**Problem**: Required tables don't exist
**Solutions**:
1. Run migrations: `npm run db:migrate`
2. Push schema: `npx prisma db push`
3. Reset database: `npm run db:reset` (⚠️ This deletes all data)

### ❌ Limited Permissions
**Problem**: Database user doesn't have full CRUD permissions
**Solutions**:
1. Grant permissions: `GRANT ALL PRIVILEGES ON DATABASE "ecommerce-project" TO postgres;`
2. Check user role: `\du` in psql
3. Update user permissions in PostgreSQL

## 📝 Database URL Format

```env
# PostgreSQL URL format
DATABASE_URL="postgresql://username:password@host:port/database_name"

# Example
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/ecommerce-project"
```

## 🆘 Getting Help

If the checker reports issues:

1. **Read the error messages carefully** - they contain specific guidance
2. **Check the console output** - detailed logs show exactly what failed
3. **Follow the recommended actions** - the checker provides specific next steps
4. **Verify your .env file** - ensure DATABASE_URL is correctly formatted

## 🔄 Automatic Checks

The database checker runs automatically when you start the server (`npm run dev`). Look for these messages in your console:

```
✅ Database connection: SUCCESS
✅ Database type: PostgreSQL
✅ Database tables: ALL REQUIRED TABLES EXIST
✅ Database permissions: ALL CRUD OPERATIONS ALLOWED
🎉 PostgreSQL Database is properly configured and ready!
```

## 🌐 API Endpoint Response

The `/health/database` endpoint returns:

```json
{
  "status": "OK",
  "message": "Database is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": {
    "connection": { "success": true, "message": "Database connected successfully" },
    "databaseType": { "success": true, "type": "PostgreSQL", "version": "14.9" },
    "tables": { "success": true, "existingTables": [...], "message": "All required tables exist" },
    "permissions": { "success": true, "permissions": {...}, "message": "All CRUD operations allowed" }
  }
}
```

---

**Need more help?** Check the server logs or contact the development team.