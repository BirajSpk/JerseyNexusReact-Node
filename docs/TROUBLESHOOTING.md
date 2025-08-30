# JerseyNexus Troubleshooting Guide

## 🔧 Common Issues and Solutions

### 1. Products Not Loading in Frontend

**Problem**: Products page shows empty or loading state indefinitely.

**Root Causes & Solutions**:

#### A. Port Mismatch (FIXED)
- **Issue**: Frontend Vite proxy was pointing to port 5000, but backend runs on port 5001
- **Solution**: Updated `frontend/vite.config.js` proxy target to `http://localhost:5001`

#### B. API Response Parsing (FIXED)
- **Issue**: Frontend expecting different data structure than backend provides
- **Solution**: Updated frontend to correctly parse `data.data.categories` instead of `data.data`

#### C. Missing Search/Filter Support (FIXED)
- **Issue**: Backend product controller didn't support search, category filtering, or pagination
- **Solution**: Enhanced product controller with:
  - Search functionality (name, description, brand)
  - Category filtering
  - Featured products filter
  - Proper pagination with metadata

### 2. Admin Login Issues

**Problem**: Admin panel login fails or doesn't authenticate properly.

**Root Causes & Solutions**:

#### A. Incorrect API URL
- **Issue**: Admin dataProvider using wrong port
- **Current**: Correctly set to `http://localhost:5001/api`
- **Verify**: Check `admin/src/dataProvider.js` line 4

#### B. Authentication Flow
- **Issue**: Token not being stored or sent properly
- **Solution**: Verify `admin/src/authProvider.js` handles token storage correctly

#### C. CORS Issues
- **Issue**: Backend not allowing admin panel origin
- **Solution**: Backend CORS is configured for `http://localhost:3001` (admin panel)

### 3. Database Connection Issues

**Problem**: Backend fails to start or connect to database.

**Solutions**:
1. **Check Database Status**:
   ```bash
   # Check if PostgreSQL is running
   pg_ctl status
   
   # Start PostgreSQL if not running
   pg_ctl start
   ```

2. **Verify Database URL**:
   ```bash
   # Check backend/.env
   DATABASE_URL="postgresql://postgres:@Qqa124@localhost:5432/ecommerce-project"
   ```

3. **Run Database Migrations**:
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

### 4. Environment Configuration Issues

**Problem**: Environment variables not loading correctly.

**Solutions**:

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://postgres:@Qqa124@localhost:5432/ecommerce-project"

# Server
PORT=5001
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Admin Credentials
ADMIN_EMAIL="admin@jerseynexus.com"
ADMIN_PASSWORD="Admin123!@#"
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001/api
VITE_BACKEND_URL=http://localhost:5001
VITE_APP_NAME=JerseyNexus
```

### 5. File Upload Issues

**Problem**: Image uploads fail or don't display correctly.

**Solutions**:
1. **Check Upload Directory**:
   ```bash
   # Ensure uploads directory exists
   mkdir -p backend/uploads
   chmod 755 backend/uploads
   ```

2. **Verify File Size Limits**:
   - Backend: `MAX_FILE_SIZE=5242880` (5MB)
   - Frontend: `VITE_MAX_FILE_SIZE=5242880`

3. **Check File Types**:
   - Allowed: `image/jpeg,image/png,image/webp`

### 6. WebSocket Connection Issues

**Problem**: Real-time features not working.

**Solutions**:
1. **Check WebSocket URL**:
   ```env
   VITE_WS_URL=http://localhost:5001
   ```

2. **Verify Backend WebSocket Setup**:
   - WebSocket server initializes on backend startup
   - Check console for "WebSocket server ready" message

### 7. Payment Integration Issues

**Problem**: Khalti payments not working.

**Solutions**:
1. **Check Khalti Configuration**:
   ```env
   # Backend
   KHALTI_LIVE_PUBLIC_KEY="f9232cec7d034e379217555f581777cf"
   KHALTI_LIVE_SECRET_KEY="c51dd8206a5a41b6b25ce3168d1348a7"
   
   # Frontend
   VITE_KHALTI_PUBLIC_KEY=f9232cec7d034e379217555f581777cf
   ```

2. **Verify Return URL**:
   ```env
   KHALTI_RETURN_URL="http://localhost:5001/api/payments/khalti/callback"
   ```

## 🚀 Quick Diagnostic Commands

### Check Backend Health
```bash
curl http://localhost:5001/health
```

### Test Products API
```bash
curl http://localhost:5001/api/products
```

### Test Admin Login
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@jerseynexus.com","password":"Admin123!@#"}'
```

### Check Database Connection
```bash
cd backend
npm run db:check
```

## 🔍 Debugging Steps

### 1. Check All Services Are Running
```bash
# Backend (should show port 5001)
netstat -an | findstr :5001

# Frontend (should show port 3000)
netstat -an | findstr :3000

# Admin Panel (should show port 3001)
netstat -an | findstr :3001

# Database (should show port 5432)
netstat -an | findstr :5432
```

### 2. Check Browser Console
- Open Developer Tools (F12)
- Look for network errors in Console tab
- Check Network tab for failed API requests
- Verify API responses in Network tab

### 3. Check Backend Logs
- Look for error messages in backend terminal
- Check for database connection errors
- Verify CORS and authentication logs

### 4. Verify Data Flow
1. **Frontend → Backend**: Check network requests in browser dev tools
2. **Backend → Database**: Check database logs and query execution
3. **Database → Backend**: Verify data is being returned correctly
4. **Backend → Frontend**: Check API response format and data structure

## 📋 Startup Checklist

### Before Starting Development:
- [ ] PostgreSQL database is running
- [ ] Environment files (.env) are configured correctly
- [ ] Dependencies are installed (`npm install` in all directories)
- [ ] Database migrations are up to date (`npm run db:migrate`)
- [ ] Dummy data is seeded (`npm run db:seed-dummy`)

### Starting the Application:
1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Start Admin Panel**: `cd admin && npm run dev`

### Verify Everything Works:
- [ ] Backend health check: http://localhost:5001/health
- [ ] Frontend loads: http://localhost:3000
- [ ] Admin panel loads: http://localhost:3001
- [ ] Products display on frontend
- [ ] Admin login works
- [ ] API endpoints respond correctly

## 🆘 Emergency Reset

If nothing works, try this complete reset:

```bash
# Stop all processes
npx kill-port 3000
npx kill-port 3001
npx kill-port 5001

# Reset database
cd backend
npm run db:reset
npm run db:migrate
npm run db:seed

# Reinstall dependencies
cd ..
npm run install:all

# Start fresh
npm run dev:all
```

## 📞 Getting Help

If issues persist:
1. Check the API endpoints documentation: `docs/API_ENDPOINTS.md`
2. Review the setup guide: `docs/SETUP.md`
3. Check recent git commits for breaking changes
4. Verify all environment variables are set correctly
5. Test individual API endpoints using the provided curl commands
