#!/usr/bin/env node

/**
 * Create New Admin User Script
 * Usage: node scripts/createAdmin.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('🔐 Creating new admin user...');

  try {
    // Admin user details
    const adminData = {
      name: 'Super Admin',
      email: 'superadmin@jerseynexus.com',
      password: 'SuperAdmin123!@#',
      role: 'ADMIN'
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);
    
    // Create or update admin user
    const admin = await prisma.user.upsert({
      where: { email: adminData.email },
      update: {
        name: adminData.name,
        password: hashedPassword,
        role: adminData.role,
      },
      create: {
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Role:', admin.role);
    console.log('🆔 ID:', admin.id);
    
    // Also create the original admin if it doesn't exist
    const originalAdminPassword = 'Admin123!@#';
    const originalHashedPassword = await bcrypt.hash(originalAdminPassword, 12);
    
    const originalAdmin = await prisma.user.upsert({
      where: { email: 'admin@jerseynexus.com' },
      update: {},
      create: {
        name: 'JerseyNexus Admin',
        email: 'admin@jerseynexus.com',
        password: originalHashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('\n✅ Original admin user ensured:');
    console.log('📧 Email:', originalAdmin.email);
    console.log('🔑 Password:', originalAdminPassword);
    console.log('👤 Role:', originalAdmin.role);

    // Display all admin users
    const allAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    console.log('\n📋 All Admin Users:');
    console.table(allAdmins);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'P2002') {
      console.log('ℹ️  Admin user with this email already exists');
      
      // Show existing admin
      const existingAdmin = await prisma.user.findUnique({
        where: { email: 'superadmin@jerseynexus.com' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
      
      if (existingAdmin) {
        console.log('📋 Existing Admin:');
        console.table([existingAdmin]);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdmin()
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
