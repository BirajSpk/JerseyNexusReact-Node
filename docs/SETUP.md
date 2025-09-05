# JerseyNexus - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Environment Setup

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/jerseynexus"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
ADMIN_EMAIL="admin@jerseynexus.com"
ADMIN_PASSWORD="Admin123!@#"
```

#### Frontend Environment
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=JerseyNexus
```

### 2. Installation

#### Install Dependencies
```bash
# Root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

#### Database Setup
```bash
# Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 3. Development

#### Start All Services
```bash
npm run dev
```

This will start:
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000  
- Admin Dashboard: http://localhost:3001

#### Individual Services
```bash
# Backend only
npm run dev:backend

# Frontend only  
npm run dev:frontend

# Admin only
npm run dev:admin
```

## 📁 Project Structure

```
JerseyNexus/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── middlewares/     # Custom middleware
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions
│   │   ├── config/          # Configuration files
│   │   └── tests/           # Test files
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store & slices
│   │   ├── utils/           # Helper functions
│   │   └── hooks/           # Custom hooks
│   └── package.json
├── admin/                   # React Admin dashboard
│   ├── src/
│   │   ├── resources/       # Admin resources
│   │   ├── theme.js         # JerseyNexus theme
│   │   └── dataProvider.js  # Data provider
│   └── package.json
├── docs/                    # Documentation
└── package.json            # Root package.json
```

## 🎨 Features

### Customer Features
- ✅ Product browsing & search
- ✅ Shopping cart management
- ✅ User authentication (JWT)
- ✅ Order management
- ✅ Product reviews
- ✅ Blog reading
- ✅ Mobile-responsive design
- ✅ JerseyNexus branding

### Admin Features
- React Admin dashboard
- Product management
- Order management
- User management
- Category management
- Blog management
- Review moderation
- JerseyNexus themed interface

### Technical Features
- PostgreSQL database with Prisma ORM
- JWT authentication & authorization
- RESTful API design
- Input validation & sanitization
- Error handling & logging
- CORS & security headers
- Rate limiting
- SEO optimization
- Image handling with alt text

## Testing

```bash
# Run all tests
npm test

# Backend tests
npm run test:backend

# Frontend tests  
npm run test:frontend
```

## Production Deployment

### Build
```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are set:
- Strong JWT secrets
- Production database URL
- CORS origins
- File upload limits

### Database
```bash
# Production migration
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

## 📊 Default Admin Access

After seeding the database:
- **Email**: admin@jerseynexus.com
- **Password**: Admin123!@#

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- CSRF protection
- XSS protection
- Rate limiting
- Input validation
- SQL injection prevention

## 📱 Mobile Support

JerseyNexus is built mobile-first with:
- Responsive TailwindCSS design
- Touch-friendly interface
- Mobile navigation
- Optimized performance

## 🇳🇵 Nepal Localization

- Currency: NPR (Nepalese Rupee)
- Phone format: +977 9811543215
- Local contact information
- Nepal-specific features

## 🎯 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Redux Toolkit, Framer Motion
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL
- **Admin**: React Admin with custom JerseyNexus theme
- **Authentication**: JWT with bcrypt
- **Testing**: Jest, React Testing Library, Supertest

## 📞 Support

For support and questions:
- **Phone**: +977 9811543215
- **Email**: info@jerseynexus.com

---

© JerseyNexus 2024 | Made with ❤️ in Nepal