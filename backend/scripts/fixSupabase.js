#!/usr/bin/env node

/**
 * Fix Supabase Connection Script
 * Usage: node scripts/fixSupabase.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function fixSupabaseConnection() {
  console.log('🔧 Fixing Supabase PostgreSQL Connection...\n');

  // Test different connection string formats
  const connectionStrings = [
    // Original with SSL
    `postgresql://postgres.jskkhidzdattbnuufvop:%21%40%23%24%25QWERTY12345@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require`,
    
    // With connection pooling
    `postgresql://postgres.jskkhidzdattbnuufvop:%21%40%23%24%25QWERTY12345@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1`,
    
    // Direct connection (non-pooler)
    `postgresql://postgres.jskkhidzdattbnuufvop:%21%40%23%24%25QWERTY12345@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=10`,
    
    // Alternative format
    `postgresql://postgres.jskkhidzdattbnuufvop:!@#$%QWERTY12345@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require`
  ];

  for (let i = 0; i < connectionStrings.length; i++) {
    console.log(`🧪 Test ${i + 1}: Testing connection string format ${i + 1}...`);
    
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: connectionStrings[i]
          }
        },
        log: ['error']
      });

      await prisma.$connect();
      
      // Test a simple query
      const result = await prisma.$queryRaw`SELECT version()`;
      console.log(`✅ Connection ${i + 1} successful!`);
      console.log(`📊 Database version: ${result[0].version}`);
      
      // Test table access
      const userCount = await prisma.user.count();
      console.log(`👥 Users in database: ${userCount}`);
      
      await prisma.$disconnect();
      
      console.log(`\n🎉 Working connection string found!`);
      console.log(`Use this in your .env file:`);
      console.log(`DATABASE_URL="${connectionStrings[i]}"`);
      
      return true;
      
    } catch (error) {
      console.log(`❌ Connection ${i + 1} failed: ${error.message}`);
      
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        // Ignore disconnect errors
      }
    }
  }

  console.log('\n❌ All connection attempts failed!');
  
  console.log('\n🔧 Manual troubleshooting steps:');
  console.log('1. Check your Supabase project status at https://supabase.com/dashboard');
  console.log('2. Verify your database is not paused');
  console.log('3. Check if your IP is whitelisted in Supabase settings');
  console.log('4. Try connecting from Supabase SQL Editor first');
  console.log('5. Generate a new database password if needed');
  
  return false;
}

// Alternative: Use local PostgreSQL if Supabase fails
async function setupLocalPostgreSQL() {
  console.log('\n🔄 Setting up local PostgreSQL fallback...');
  
  const localConnectionString = 'postgresql://postgres:password@localhost:5432/jerseynexus';
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: localConnectionString
        }
      }
    });

    await prisma.$connect();
    console.log('✅ Local PostgreSQL connection successful!');
    
    // Create database schema
    await prisma.$executeRaw`CREATE DATABASE IF NOT EXISTS jerseynexus`;
    
    await prisma.$disconnect();
    
    console.log('\n📝 To use local PostgreSQL, update your .env:');
    console.log(`DATABASE_URL="${localConnectionString}"`);
    console.log('\nThen run: npx prisma db push');
    
    return true;
    
  } catch (error) {
    console.log('❌ Local PostgreSQL not available:', error.message);
    return false;
  }
}

// Run the fix
fixSupabaseConnection()
  .then(async (success) => {
    if (!success) {
      console.log('\n🔄 Trying local PostgreSQL fallback...');
      const localSuccess = await setupLocalPostgreSQL();
      
      if (!localSuccess) {
        console.log('\n💡 Consider these alternatives:');
        console.log('1. Use Supabase web interface to check connection');
        console.log('2. Create a new Supabase project');
        console.log('3. Use a different PostgreSQL provider');
        console.log('4. Install PostgreSQL locally');
      }
    }
    
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Script error:', error);
    process.exit(1);
  });
