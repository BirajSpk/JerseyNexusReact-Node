// Alternative Supabase connection configuration
// Use this if DATABASE_URL with special characters doesn't work

const { PrismaClient } = require('@prisma/client');

// Function to create Supabase connection URL
function createSupabaseUrl() {
  const host = process.env.SUPABASE_HOST;
  const port = process.env.SUPABASE_PORT;
  const database = process.env.SUPABASE_DATABASE;
  const username = process.env.SUPABASE_USERNAME;
  const password = process.env.SUPABASE_PASSWORD;

  if (!host || !port || !database || !username || !password) {
    throw new Error('Missing Supabase configuration. Please check your environment variables.');
  }

  // Encode the password properly
  const encodedPassword = encodeURIComponent(password);
  
  return `postgresql://${username}:${encodedPassword}@${host}:${port}/${database}`;
}

// Create Prisma client with Supabase configuration
function createSupabasePrismaClient() {
  try {
    const databaseUrl = createSupabaseUrl();
    console.log('🔗 Connecting to Supabase with URL:', databaseUrl.replace(/:[^:@]*@/, ':****@'));
    
    return new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      log: ['query', 'info', 'warn', 'error'],
    });
  } catch (error) {
    console.error('❌ Failed to create Supabase Prisma client:', error.message);
    throw error;
  }
}

// Test Supabase connection
async function testSupabaseConnection() {
  const prisma = createSupabasePrismaClient();
  
  try {
    console.log('🧪 Testing Supabase connection...');
    await prisma.$connect();
    console.log('✅ Supabase connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 Database version:', result[0].version);
    
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = {
  createSupabaseUrl,
  createSupabasePrismaClient,
  testSupabaseConnection
};
