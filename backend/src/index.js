const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const path = require('path');
const WebSocketService = require('./utils/websocket');
const DatabaseChecker = require('./utils/dbCheck');
require('dotenv').config();
const { prisma, connectWithRetry } = require("../src/config/database.js")

// Initialize database connection with retry logic
connectWithRetry().catch(console.error);

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

// Trust proxy for Render deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  // Allow images and other static assets to be loaded from a different origin (e.g., Vite dev server)
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration - unified for both HTTP and WebSocket
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || process.env.CORS || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting - disabled for development, enabled for production
console.log(' Rate limiting has been completely disabled for this project');


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Connect to database and ensure schema is ready
prisma.$connect().then(async () => {
  console.log('✅ Database connected successfully');

  // Check if we need to run migrations
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database schema is ready');
  } catch (error) {
    console.log('⚠️  Database schema check failed, this is normal on first deployment');
  }
}).catch(console.error);

// Static files - use absolute path to ensure uploads are served correctly
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

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

const DEFAULT_PORT = Number(process.env.PORT) || 5003;

// Try to listen on a port; if EADDRINUSE, increment and retry up to maxAttempts
async function listenWithFallback(startPort, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    const tryListen = (port) => {
      attempt++;
      const onError = (err) => {
        if (err.code === 'EADDRINUSE' && attempt < maxAttempts) {
          console.error(`❌ Port ${port} is already in use. Trying ${port + 1}...`);
          setTimeout(() => tryListen(port + 1), 150);
        } else {
          reject(err);
        }
      };
      server.once('error', onError);
      server.listen(port, () => {
        server.off('error', onError);
        resolve(port);
      });
    };
    tryListen(startPort);
  });
}

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

  try {
    const port = await listenWithFallback(DEFAULT_PORT, 15);
    console.log(`[INFO] JerseyNexus API running on port ${port}`);
    console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[INFO] Health check: http://localhost:${port}/health`);
    console.log(`[INFO] Database check: http://localhost:${port}/health/database`);
    console.log(`[INFO] WebSocket server ready`);

    // Initialize WebSocket service once server is listening
    WebSocketService.initialize(server);
  } catch (err) {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`❌ All attempted ports are in use starting from ${DEFAULT_PORT}. Try another port or free the port.`);
    } else {
      console.error('❌ Failed to start server:', err);
    }
    process.exit(1);
  }
}


//seeding the dummy data
// seedDummyData();

// Start the server
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
