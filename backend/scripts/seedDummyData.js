#!/usr/bin/env node

/**
 * Seed dummy data for JerseyNexus
 * Run this script to populate the database with sample products and admin user
 * 
 * Usage: node scripts/seedDummyData.js
 */

require('dotenv').config();
const { seedDummyData } = require('../src/utils/dummyData');

async function main() {
  console.log('🚀 JerseyNexus Dummy Data Seeder');
  console.log('================================\n');

  try {
    await seedDummyData();
    console.log('\n✅ All done! Your database is now populated with dummy data.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to seed dummy data:', error.message);
    process.exit(1);
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log('\n👋 Seeding interrupted. Exiting...');
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
