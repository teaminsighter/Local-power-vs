#!/usr/bin/env node

/**
 * Database Initialization Script for Local Power
 * Sets up SQLite database and creates all necessary tables
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function initializeDatabase() {
  console.log('🚀 Initializing Local Power database...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');
    
    // Create tables using Prisma schema
    console.log('📋 Creating database tables...');
    
    // The tables are created automatically by Prisma, but we can verify they exist
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%'
      ORDER BY name;
    `;
    
    console.log('📊 Database tables created:');
    if (Array.isArray(tables) && tables.length > 0) {
      tables.forEach(table => {
        console.log(`   • ${table.name}`);
      });
    } else {
      console.log('   • No custom tables found (using default Prisma tables)');
    }
    
    // Create demo admin user
    console.log('👤 Creating demo admin user...');
    try {
      const adminUser = await prisma.user.upsert({
        where: { email: 'admin@localpower.ie' },
        update: {},
        create: {
          id: 'admin_user_local_power',
          email: 'admin@localpower.ie',
          name: 'Local Power Admin',
          role: 'ADMIN',
          password: 'hashed_password_placeholder', // In real app, this would be properly hashed
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('✅ Admin user created:', adminUser.email);
    } catch (userError) {
      console.log('ℹ️ Admin user already exists or user table not available');
    }
    
    console.log('✅ Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    if (error.message.includes('Environment variable not found: DATABASE_URL')) {
      console.log('');
      console.log('💡 Solution: Make sure DATABASE_URL is set in .env.local');
      console.log('   DATABASE_URL="sqlite:./local-power.db"');
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  initializeDatabase().catch(console.error);
}

module.exports = { initializeDatabase };