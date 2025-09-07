const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const path = require('path');
const WebSocketService = require('./utils/websocket');
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
  
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
if(process.env.NODE_ENV === 'production'){

// CORS configuration - unified for both HTTP and WebSocket
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || process.env.CORS || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200
}));

}
else{
  app.use(cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200
  }));
}
  

if(process.env.NODE_ENV === 'production'){
    app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
    }))

};


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}


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


// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const DEFAULT_PORT = Number(process.env.PORT) || 5003;


async function startServer() {

  try {
    
    server.listen(DEFAULT_PORT, () => {
      console.log(`[INFO] JerseyNexus API running on port ${DEFAULT_PORT}`);
    });
    WebSocketService.initialize(server);
  } catch (err) {
    if (err && err.code === 'EADDRINUSE') {
      console.error(` All attempted ports are in use starting from ${DEFAULT_PORT}. Try another port or free the port.`);
    } else {
      console.error(' Failed to start server:', err);
    }
   
  }
}



startServer().catch(error => {
  console.error(' Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
