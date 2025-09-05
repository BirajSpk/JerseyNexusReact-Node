const { PrismaClient } = require('@prisma/client');

// Create a robust Prisma client with connection pooling and retry logic
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'minimal',
  // Add connection pool settings for better stability
  __internal: {
    engine: {
      connectTimeout: 60000,
      pool: {
        timeout: 60000,
      },
    },
  },
});

// Connection retry logic
async function connectWithRetry(maxRetries = 5, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      console.log(`❌ Database connection attempt ${i + 1} failed:`, error.message);

      if (i === maxRetries - 1) {
        console.error('💥 All database connection attempts failed');
        throw error;
      }

      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5; // Exponential backoff
    }
  }
}

// Enhanced query wrapper with retry logic
async function executeWithRetry(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Query attempt ${i + 1} failed:`, error.message);

      if (i === maxRetries - 1) {
        throw error;
      }

      // Reconnect if connection was lost
      if (error.message.includes("Can't reach database server")) {
        console.log('🔄 Attempting to reconnect...');
        try {
          await prisma.$disconnect();
          await connectWithRetry(3, 1000);
        } catch (reconnectError) {
          console.error('Failed to reconnect:', reconnectError.message);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔌 Disconnecting from database...');
  await prisma.$disconnect();
});

module.exports = {
  prisma,
  connectWithRetry,
  executeWithRetry
};