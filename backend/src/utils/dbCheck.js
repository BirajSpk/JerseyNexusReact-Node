const { PrismaClient } = require('@prisma/client');

class DatabaseChecker {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Check if database connection is working
   */
  async checkConnection() {
    try {
      await this.prisma.$connect();
      console.log('[SUCCESS] Database connection: SUCCESS');
      return { success: true, message: 'Database connected successfully' };
    } catch (error) {
      console.error('[ERROR] Database connection: FAILED');
      console.error('Error details:', error.message);
      return {
        success: false,
        message: 'Database connection failed',
        error: error.message
      };
    }
  }

  /**
   * Check if database is PostgreSQL
   */
  async checkDatabaseType() {
    try {
      const result = await this.prisma.$queryRaw`SELECT version()`;
      if (result && result[0] && result[0].version) {
        const version = result[0].version;
        if (version.toLowerCase().includes('postgresql')) {
          console.log('✅ Database type: PostgreSQL');
          console.log(`📊 Version: ${version.split(' ')[1]}`);
          return { 
            success: true, 
            type: 'PostgreSQL', 
            version: version.split(' ')[1],
            fullVersion: version
          };
        } else {
          console.log('⚠️  Database type: Not PostgreSQL');
          return { 
            success: false, 
            type: 'Unknown', 
            message: 'Database is not PostgreSQL' 
          };
        }
      }
    } catch (error) {
      console.error('[ERROR] Database type check: FAILED');
      console.error('Error details:', error.message);
      return {
        success: false,
        message: 'Failed to check database type',
        error: error.message
      };
    }
  }

  /**
   * Check if required tables exist
   */
  async checkTables() {
    try {
      const tables = await this.prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `;

      const requiredTables = [
        'users', 'products', 'categories', 'orders', 'order_items',
        'reviews', 'blogs'
      ];

      const existingTables = tables.map(t => t.table_name);
      const missingTables = requiredTables.filter(table => 
        !existingTables.some(existing => 
          existing.toLowerCase() === table.toLowerCase()
        )
      );

      if (missingTables.length === 0) {
        console.log('[SUCCESS] Database tables: ALL REQUIRED TABLES EXIST');
        console.log(`[INFO] Found tables: ${existingTables.join(', ')}`);
        return {
          success: true,
          existingTables,
          message: 'All required tables exist'
        };
      } else {
        console.log('[WARN] Database tables: MISSING TABLES');
        console.log(`[ERROR] Missing: ${missingTables.join(', ')}`);
        console.log(`[SUCCESS] Existing: ${existingTables.join(', ')}`);
        return {
          success: false,
          existingTables,
          missingTables,
          message: `Missing tables: ${missingTables.join(', ')}`
        };
      }
    } catch (error) {
      console.error('[ERROR] Table check: FAILED');
      console.error('Error details:', error.message);
      return {
        success: false,
        message: 'Failed to check tables',
        error: error.message
      };
    }
  }

  /**
   * Check database permissions
   */
  async checkPermissions() {
    try {
      // Test basic CRUD operations
      const tests = {
        read: false,
        write: false,
        update: false,
        delete: false
      };

      // Test READ permission
      try {
        await this.prisma.user.findMany({ take: 1 });
        tests.read = true;
      } catch (error) {
        console.log('❌ READ permission: FAILED');
      }

      // Test WRITE permission (try to create and immediately delete a test record)
      try {
        const testUser = await this.prisma.user.create({
          data: {
            name: 'DB_TEST_USER',
            email: `test_${Date.now()}@dbcheck.com`,
            password: 'test123'
          }
        });
        tests.write = true;

        // Test UPDATE permission
        try {
          await this.prisma.user.update({
            where: { id: testUser.id },
            data: { name: 'DB_TEST_USER_UPDATED' }
          });
          tests.update = true;
        } catch (error) {
          console.log('❌ UPDATE permission: FAILED');
        }

        // Test DELETE permission
        try {
          await this.prisma.user.delete({
            where: { id: testUser.id }
          });
          tests.delete = true;
        } catch (error) {
          console.log('❌ DELETE permission: FAILED');
        }

      } catch (error) {
        console.log('❌ WRITE permission: FAILED');
      }

      const allPermissions = Object.values(tests).every(test => test);
      
      if (allPermissions) {
        console.log('[SUCCESS] Database permissions: ALL CRUD OPERATIONS ALLOWED');
      } else {
        console.log('[WARN] Database permissions: LIMITED ACCESS');
        console.log(`[INFO] Permissions: READ(${tests.read ? 'OK' : 'FAIL'}) WRITE(${tests.write ? 'OK' : 'FAIL'}) UPDATE(${tests.update ? 'OK' : 'FAIL'}) DELETE(${tests.delete ? 'OK' : 'FAIL'})`);
      }

      return { 
        success: allPermissions, 
        permissions: tests,
        message: allPermissions ? 'All CRUD operations allowed' : 'Limited database permissions'
      };

    } catch (error) {
      console.error('[ERROR] Permission check: FAILED');
      console.error('Error details:', error.message);
      return {
        success: false,
        message: 'Failed to check permissions',
        error: error.message
      };
    }
  }

  /**
   * Run comprehensive database check
   */
  async runFullCheck() {
    console.log('\n🔍 Starting PostgreSQL Database Health Check...\n');
    
    const results = {
      connection: await this.checkConnection(),
      databaseType: await this.checkDatabaseType(),
      tables: await this.checkTables(),
      permissions: await this.checkPermissions()
    };

    console.log('\n📊 Database Check Summary:');
    console.log('================================');
    console.log(`Connection: ${results.connection.success ? '✅ OK' : '❌ FAILED'}`);
    console.log(`Database Type: ${results.databaseType.success ? '✅ PostgreSQL' : '❌ NOT PostgreSQL'}`);
    console.log(`Tables: ${results.tables.success ? '✅ ALL PRESENT' : '❌ MISSING TABLES'}`);
    console.log(`Permissions: ${results.permissions.success ? '✅ FULL ACCESS' : '❌ LIMITED ACCESS'}`);
    console.log('================================\n');

    const overallSuccess = Object.values(results).every(result => result.success);
    
    if (overallSuccess) {
      console.log('[SUCCESS] PostgreSQL Database is properly configured and ready!');
    } else {
      console.log('[WARN] PostgreSQL Database has issues that need attention.');
      console.log('[INFO] Recommended actions:');
      if (!results.connection.success) {
        console.log('   1. Check your DATABASE_URL in .env file');
        console.log('   2. Ensure PostgreSQL server is running');
        console.log('   3. Verify database credentials');
      }
      if (!results.databaseType.success) {
        console.log('   1. Ensure you are connecting to a PostgreSQL database');
      }
      if (!results.tables.success) {
        console.log('   1. Run: npx prisma migrate dev');
        console.log('   2. Or run: npx prisma db push');
      }
      if (!results.permissions.success) {
        console.log('   1. Check database user permissions');
        console.log('   2. Grant necessary privileges to the database user');
      }
    }

    return { success: overallSuccess, details: results };
  }

  /**
   * Cleanup database connection
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = DatabaseChecker;