const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const WebSocketService = require('./utils/websocket');
const DatabaseChecker = require('./utils/dbCheck');
require('dotenv').config();
const prisma = require("../src/config/database.js") 
const seedDummyData = require('./utils/dummyData');
prisma.$connect();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const blogRoutes = require('./routes/blogs');
const paymentRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/uploads');

const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting - disabled for development, enabled for production
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100, // 100 for production
    message: {
      error: 'Too many requests from this IP, please try again later.'
    }
  });
  app.use('/api/', limiter);
  console.log('🛡️ Rate limiting enabled for production');
} else {
  console.log('🚀 Rate limiting disabled for development');
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'JerseyNexus API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Database health check endpoint
app.get('/health/database', async (req, res) => {
  const dbChecker = new DatabaseChecker();
  try {
    const result = await dbChecker.runFullCheck();
    await dbChecker.disconnect();
    
    res.status(result.success ? 200 : 500).json({
      status: result.success ? 'OK' : 'ERROR',
      message: result.success ? 'Database is healthy' : 'Database has issues',
      timestamp: new Date().toISOString(),
      details: result.details
    });
  } catch (error) {
    await dbChecker.disconnect();
    res.status(500).json({
      status: 'ERROR',
      message: 'Database check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/uploads', uploadRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to JerseyNexus API',
    description: 'Sportswear & Jersey E-commerce Platform for Nepal',
    contact: '+977 9811543215',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      reviews: '/api/reviews',
      blogs: '/api/blogs',
      payments: '/api/payments',
      uploads: '/api/uploads'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Database startup check
async function startServer() {
  const dbChecker = new DatabaseChecker();
  
  try {
    // Run database check on startup
    const dbResult = await dbChecker.runFullCheck();
    
    if (!dbResult.success) {
      console.log('⚠️  Warning: Database issues detected but server will continue...');
    }
    
    await dbChecker.disconnect();
  } catch (error) {
    console.error('❌ Database check failed on startup:', error.message);
    console.log('⚠️  Warning: Continuing without database verification...');
  }

  server.listen(PORT, () => {
    console.log(`🚀 JerseyNexus API running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`🗄️  Database check: http://localhost:${PORT}/health/database`);
    console.log(`🔌 WebSocket server ready`);
  });

  // Initialize WebSocket service
  WebSocketService.initialize(server);
}



// Start the server
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
