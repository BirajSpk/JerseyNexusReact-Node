#!/usr/bin/env node

/**
 * PostgreSQL Database Setup Checker
 * Run this script to verify your PostgreSQL database is properly configured
 * 
 * Usage: node scripts/checkDatabase.js
 */

require('dotenv').config();
const DatabaseChecker = require('../src/utils/dbCheck');

async function main() {
  console.log('🗄️  JerseyNexus PostgreSQL Database Checker');
  console.log('===========================================\n');

  const dbChecker = new DatabaseChecker();
  
  try {
    const result = await dbChecker.runFullCheck();
    
    if (result.success) {
      console.log('🎯 Result: Your PostgreSQL database is ready for JerseyNexus!');
      process.exit(0);
    } else {
      console.log('🚨 Result: Database configuration needs attention.');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Critical Error:', error.message);
    process.exit(1);
  } finally {
    await dbChecker.disconnect();
  }
}

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n👋 Database check interrupted. Cleaning up...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main();