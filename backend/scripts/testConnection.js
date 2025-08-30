#!/usr/bin/env node

/**
 * JerseyNexus Connection Tester
 * Tests backend-frontend connectivity and database setup
 */

const { spawn } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ConnectionTester {
  constructor() {
    this.backendUrl = 'http://localhost:5001';
    this.frontendUrl = 'http://localhost:3000';
    this.processes = [];
  }

  async testDatabaseConnection() {
    console.log('🔍 Testing Database Connection...');
    
    try {
      const response = await axios.get(`${this.backendUrl}/health/database`, {
        timeout: 10000
      });
      
      if (response.data.status === 'OK') {
        console.log('✅ Database: Connected successfully');
        return true;
      } else {
        console.log('❌ Database: Connection issues detected');
        console.log('📋 Details:', response.data.details);
        return false;
      }
    } catch (error) {
      console.log('❌ Database: Connection failed');
      console.log('💡 Error:', error.message);
      return false;
    }
  }

  async testBackendHealth() {
    console.log('🔍 Testing Backend Health...');
    
    try {
      const response = await axios.get(`${this.backendUrl}/health`, {
        timeout: 5000
      });
      
      if (response.data.status === 'OK') {
        console.log('✅ Backend: Server is running');
        return true;
      } else {
        console.log('❌ Backend: Server health check failed');
        return false;
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Backend: Server is not running');
        console.log('💡 Try: npm run dev in backend directory');
      } else {
        console.log('❌ Backend: Health check failed');
        console.log('💡 Error:', error.message);
      }
      return false;
    }
  }

  async testFrontendHealth() {
    console.log('🔍 Testing Frontend Health...');
    
    try {
      const response = await axios.get(this.frontendUrl, {
        timeout: 5000
      });
      
      if (response.status === 200) {
        console.log('✅ Frontend: Server is running');
        return true;
      } else {
        console.log('❌ Frontend: Server responded with status', response.status);
        return false;
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Frontend: Server is not running');
        console.log('💡 Try: npm run dev in frontend directory');
      } else {
        console.log('❌ Frontend: Health check failed');
        console.log('💡 Error:', error.message);
      }
      return false;
    }
  }

  async testAPIConnection() {
    console.log('🔍 Testing API Connectivity...');
    
    try {
      // Test CORS and API endpoints
      const response = await axios.get(`${this.backendUrl}/api/categories`, {
        timeout: 5000,
        headers: {
          'Origin': this.frontendUrl
        }
      });
      
      console.log('✅ API: CORS and endpoints working');
      return true;
    } catch (error) {
      if (error.response?.status === 200) {
        console.log('✅ API: Endpoints accessible');
        return true;
      } else {
        console.log('❌ API: Connection failed');
        console.log('💡 Error:', error.response?.data?.error || error.message);
        return false;
      }
    }
  }

  checkEnvironmentFiles() {
    console.log('🔍 Checking Environment Files...');
    
    const backendEnv = path.join(__dirname, '../../.env');
    const frontendEnv = path.join(__dirname, '../../../frontend/.env');
    
    let allGood = true;
    
    if (fs.existsSync(backendEnv)) {
      console.log('✅ Backend .env: Found');
    } else {
      console.log('❌ Backend .env: Missing');
      allGood = false;
    }
    
    if (fs.existsSync(frontendEnv)) {
      console.log('✅ Frontend .env: Found');
    } else {
      console.log('❌ Frontend .env: Missing');
      allGood = false;
    }
    
    return allGood;
  }

  async runFullTest() {
    console.log('🧪 JerseyNexus Connection Test Suite');
    console.log('====================================\n');

    const results = {
      environment: this.checkEnvironmentFiles(),
      backend: await this.testBackendHealth(),
      database: false,
      api: false,
      frontend: await this.testFrontendHealth()
    };

    if (results.backend) {
      results.database = await this.testDatabaseConnection();
      results.api = await this.testAPIConnection();
    }

    console.log('\n📊 Connection Test Summary:');
    console.log('============================');
    console.log(`Environment Files: ${results.environment ? '✅ OK' : '❌ MISSING'}`);
    console.log(`Backend Server: ${results.backend ? '✅ RUNNING' : '❌ DOWN'}`);
    console.log(`Database: ${results.database ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
    console.log(`API Endpoints: ${results.api ? '✅ ACCESSIBLE' : '❌ INACCESSIBLE'}`);
    console.log(`Frontend Server: ${results.frontend ? '✅ RUNNING' : '❌ DOWN'}`);
    
    const allPassing = Object.values(results).every(result => result);
    
    if (allPassing) {
      console.log('\n🎉 All systems operational! Backend and Frontend are properly connected.');
    } else {
      console.log('\n⚠️  Issues detected. Follow the troubleshooting guide below:');
      this.printTroubleshootingGuide(results);
    }

    return allPassing;
  }

  printTroubleshootingGuide(results) {
    console.log('\n🔧 Troubleshooting Guide:');
    console.log('=========================');

    if (!results.environment) {
      console.log('\n📁 Environment Files:');
      console.log('   1. Ensure .env file exists in backend directory');
      console.log('   2. Ensure .env file exists in frontend directory');
      console.log('   3. Check DATABASE_URL and API endpoints configuration');
    }

    if (!results.backend) {
      console.log('\n🖥️  Backend Server:');
      console.log('   1. Navigate to backend directory: cd backend');
      console.log('   2. Install dependencies: npm install');
      console.log('   3. Start server: npm run dev');
      console.log('   4. Check port 5001 is available');
    }

    if (!results.database) {
      console.log('\n🗄️  Database:');
      console.log('   1. Install PostgreSQL if not installed');
      console.log('   2. Create database: createdb ecommerce-project');
      console.log('   3. Run migrations: npm run db:migrate');
      console.log('   4. Generate client: npm run db:generate');
      console.log('   5. Check DATABASE_URL in .env file');
    }

    if (!results.api) {
      console.log('\n🔌 API Connection:');
      console.log('   1. Check CORS configuration in backend');
      console.log('   2. Verify API_URL in frontend .env');
      console.log('   3. Check network connectivity');
      console.log('   4. Verify backend is running on correct port');
    }

    if (!results.frontend) {
      console.log('\n🌐 Frontend Server:');
      console.log('   1. Navigate to frontend directory: cd frontend');
      console.log('   2. Install dependencies: npm install');
      console.log('   3. Start server: npm run dev');
      console.log('   4. Check port 3000 is available');
    }

    console.log('\n📚 Additional Resources:');
    console.log('   • Backend setup: ./POSTGRESQL_SETUP.md');
    console.log('   • Database check: npm run db:check');
    console.log('   • API documentation: ./docs/API.md');
  }
}

// Export for use as module
module.exports = ConnectionTester;

// Run if called directly
if (require.main === module) {
  const tester = new ConnectionTester();
  
  tester.runFullTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Critical Error:', error.message);
      process.exit(1);
    });
}