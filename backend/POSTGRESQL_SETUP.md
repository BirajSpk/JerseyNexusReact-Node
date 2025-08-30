# PostgreSQL Setup for JerseyNexus

## 🐘 PostgreSQL Installation & Setup

### Windows (Recommended Method)

#### Method 1: Download from Official Website

1. **Download PostgreSQL**: Go to https://www.postgresql.org/download/windows/
2. **Install**: Run the installer and follow the setup wizard
3. **Remember**: Note down the password you set for the `postgres` user
4. **Default Port**: PostgreSQL typically runs on port `5432`

#### Method 2: Using Chocolatey (if you have it)

```bash
choco install postgresql
```

### Create Database

1. **Open SQL Shell (psql)** or **pgAdmin**
2. **Connect** using the postgres user and password you set during installation
3. **Create Database**:

```sql
CREATE DATABASE "ecommerce-project";
```

### Update Your .env File

Make sure your `.env` file has the correct DATABASE_URL:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ecommerce-project"
```

Replace `YOUR_PASSWORD` with the actual password you set during PostgreSQL installation.

## 🚀 Setup Commands

Once PostgreSQL is installed and running:

```bash
# Navigate to backend directory
cd backend

# Generate Prisma client
npm run db:generate

# Apply migrations to create tables
npm run db:migrate

# Seed the database with initial data
npm run db:seed

# Check database connection
npm run db:check
```

## 🔍 Verify Installation

### Check if PostgreSQL is Running

```bash
# Windows (Command Prompt or PowerShell)
sc query postgresql-x64-14

# Or check if the service is running in Services app
# Search "Services" in Windows Start Menu
# Look for "postgresql-x64-14" or similar
```

### Test Connection with psql

```bash
psql -U postgres -h localhost -p 5432
```

## 🆘 Troubleshooting

### PostgreSQL Not Running

```bash
# Start PostgreSQL service (Windows)
net start postgresql-x64-14

# Or use Services app to start it manually
```

### Wrong Password/User

- Check your `.env` DATABASE_URL
- Verify the username (usually `postgres`)
- Verify the password you set during installation
- Try connecting with pgAdmin to test credentials

### Database Doesn't Exist

```sql
-- Connect as postgres user first, then:
CREATE DATABASE "ecommerce-project";
```

### Port Already in Use

- Default PostgreSQL port is 5432
- Check if another service is using this port
- You can change the port in postgresql.conf if needed

## 📊 Database Management Tools

### pgAdmin (Recommended)

- **Download**: https://www.pgadmin.org/download/
- **GUI Tool**: Easy to manage databases, tables, and data
- **Installation**: Usually included with PostgreSQL installer

### Alternative Tools

- **DBeaver**: https://dbeaver.io/
- **TablePlus**: https://tableplus.com/
- **DataGrip**: https://www.jetbrains.com/datagrip/

## ✅ Verification Commands

```bash
# Check database connection
npm run db:check

# View database in browser
npm run db:studio

# Check all tables exist
npm run db:migrate
```

---

**Need Help?**

- Check PostgreSQL documentation: https://www.postgresql.org/docs/
- Verify your DATABASE_URL format in `.env`
- Run `npm run db:check` to see detailed connection diagnostics
