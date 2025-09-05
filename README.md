Live Website: https://jerseynexus.vercel.app/

# JerseyNexus - Sportswear E-commerce Platform

**JerseyNexus** is a complete sportswear & jersey e-commerce platform designed specifically for Nepal. It features a modern React frontend, robust Node.js backend, and a powerful admin dashboard.

## 🎨 Theme & Branding

- **Primary Color**: `#1A73E8` (Blue)
- **Secondary Color**: `#FF6F00` (Orange)
- **Accent Color**: `#34D399` (Green)
- **Contact**: +977 9811543215

## 🏗️ Project Structure

```
JerseyNexus/
├── frontend/          # React + Vite + TailwindCSS
├── backend/           # Node.js + Express + Prisma
├── admin/             # React Admin Dashboard
├── docs/              # Documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

1. **Clone and install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install admin dependencies
cd ../admin
npm install
```

2. **Database Setup**
```bash
cd backend
# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

3. **Start Development Servers**
```bash
# Terminal 1: Backend (Port 5000)
cd backend
npm run dev

# Terminal 2: Frontend (Port 3000)
cd frontend
npm run dev

# Terminal 3: Admin Dashboard (Port 3001)
cd admin
npm run dev
```

## 📦 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, shadcn/ui, Redux Toolkit
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL, JWT
- **Admin**: React Admin with JerseyNexus theming
- **Testing**: Jest, React Testing Library, Supertest

## 🌟 Features

### Customer Features
- Product browsing & search
- Shopping cart & checkout
- User authentication
- Order tracking
- Product reviews
- Blog reading
- Mobile-responsive design

### Admin Features
- Product management
- Order management
- User management
- Blog management
- Analytics dashboard
- SEO management

## 🔐 Security

- JWT authentication
- Password hashing with bcrypt
- CSRF protection
- Rate limiting
- Input validation & sanitization

## 📱 Mobile-First Design

JerseyNexus is built with a mobile-first approach, ensuring excellent user experience across all devices.

## 🇳🇵 Made for Nepal

Localized for Nepali market with local contact information and Nepal-specific features.

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Complete installation and setup instructions
- [API Documentation](docs/API.md) - RESTful API endpoints and usage
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions

## 🎯 Default Admin Access

After seeding the database:
- **Email**: admin@jerseynexus.com
- **Password**: Admin123!@#

## 📊 Project Status

✅ **Complete Features:**
- Project structure with frontend, backend, and admin
- PostgreSQL database with Prisma ORM
- JWT authentication and user management
- Complete CRUD APIs for all entities
- React frontend with TailwindCSS and JerseyNexus branding
- React Admin dashboard with custom theming
- Core pages (Home, Products, Cart, Checkout, etc.)
- Error handling and validation
- Mobile-responsive design
- SEO optimization
- Environment configuration

🚧 **Ready for Enhancement:**
- User authentication flows in frontend
- Complete blog system with rich text editor
- Image upload handling
- Payment integration
- Testing framework implementation
- Advanced product filtering
- Real-time order tracking

## 🛠️ Development

### Available Scripts

```bash
# Root level
npm run dev              # Start all services
npm run build            # Build all projects
npm run test             # Run all tests
npm run install:all      # Install all dependencies

# Database
npm run db:migrate       # Run database migrations
npm run db:reset         # Reset database
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- **Phone**: +977 9811543215
- **Email**: info@jerseynexus.com

---

© JerseyNexus 2024 | Contact: +977 9811543215
