#!/usr/bin/env node

/**
 * Test Supabase Connection Script
 * Usage: node scripts/testSupabase.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { testSupabaseConnection, createSupabaseUrl } = require('../src/config/supabase');

async function testConnection() {
  console.log('🔍 Testing Supabase PostgreSQL Connection...\n');

  // Test 1: Check environment variables
  console.log('📋 Environment Variables Check:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_HOST:', process.env.SUPABASE_HOST ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_USERNAME:', process.env.SUPABASE_USERNAME ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_PASSWORD:', process.env.SUPABASE_PASSWORD ? '✅ Set' : '❌ Missing');
  console.log('');

  // Test 2: Try DATABASE_URL connection
  console.log('🧪 Test 1: Using DATABASE_URL...');
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ DATABASE_URL connection successful!');
    console.log('📊 Database version:', result[0].version);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log('❌ DATABASE_URL connection failed:', error.message);
    console.log('');
  }

  // Test 3: Try alternative Supabase configuration
  console.log('🧪 Test 2: Using alternative Supabase configuration...');
  try {
    const connectionUrl = createSupabaseUrl();
    console.log('🔗 Generated URL:', connectionUrl.replace(/:[^:@]*@/, ':****@'));
    
    const success = await testSupabaseConnection();
    if (success) {
      console.log('✅ Alternative Supabase connection successful!');
      return true;
    }
  } catch (error) {
    console.log('❌ Alternative connection failed:', error.message);
  }

  // Test 4: Manual connection test
  console.log('🧪 Test 3: Manual connection with encoded password...');
  try {
    const encodedPassword = encodeURIComponent('!@#$%QWERTY12345');
    const manualUrl = `postgresql://postgres.jskkhidzdattbnuufvop:${encodedPassword}@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`;
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: manualUrl
        }
      }
    });
    
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Manual connection successful!');
    console.log('📊 Database version:', result[0].version);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log('❌ Manual connection failed:', error.message);
  }

  console.log('\n❌ All connection attempts failed!');
  console.log('\n🔧 Troubleshooting suggestions:');
  console.log('1. Verify your Supabase credentials are correct');
  console.log('2. Check if your Supabase project is active');
  console.log('3. Ensure your IP is whitelisted in Supabase');
  console.log('4. Try connecting from Supabase dashboard first');
  console.log('5. Check if the pooler URL is correct');
  
  return false;
}

// Run the test
testConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Connection test completed successfully!');
      process.exit(0);
    } else {
      console.log('\n💥 Connection test failed!');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Test script error:', error);
    process.exit(1);
  });
