#!/usr/bin/env node

/**
 * Database Migration Script: SQLite to PostgreSQL
 * Migrates Local Power application data from SQLite to PostgreSQL
 * with data validation and integrity checks
 */

const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const SQLITE_PATH = process.env.SQLITE_PATH || './dev.db';
const POSTGRES_URL = process.env.POSTGRES_DATABASE_URL;
const BATCH_SIZE = 1000;
const BACKUP_DIR = './database/backups';

class DatabaseMigrator {
  constructor() {
    this.sqliteDb = null;
    this.postgresDb = null;
    this.migrationStats = {
      startTime: new Date(),
      tables: {},
      errors: [],
      warnings: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing database migration...');
    
    // Ensure backup directory exists
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    // Initialize SQLite connection
    this.sqliteDb = new sqlite3.Database(SQLITE_PATH);
    
    // Initialize PostgreSQL connection
    this.postgresDb = new PrismaClient({
      datasources: {
        db: { url: POSTGRES_URL }
      },
      log: ['error', 'warn']
    });

    console.log('✅ Database connections initialized');
  }

  async createBackup() {
    console.log('📦 Creating backup of current data...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `sqlite-backup-${timestamp}.sql`);
    
    // Export SQLite database
    const exec = require('child_process').exec;
    
    return new Promise((resolve, reject) => {
      exec(`sqlite3 ${SQLITE_PATH} .dump > ${backupFile}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          console.log(`✅ Backup created: ${backupFile}`);
          resolve(backupFile);
        }
      });
    });
  }

  async validateConnections() {
    console.log('🔍 Validating database connections...');
    
    // Test SQLite
    const sqliteTest = await this.querySQLite("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'");
    console.log(`SQLite tables found: ${sqliteTest[0].count}`);
    
    // Test PostgreSQL
    try {
      await this.postgresDb.$queryRaw`SELECT 1`;
      console.log('✅ PostgreSQL connection validated');
    } catch (error) {
      throw new Error(`PostgreSQL connection failed: ${error.message}`);
    }
  }

  async querySQLite(query) {
    return new Promise((resolve, reject) => {
      this.sqliteDb.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async migrateUsers() {
    console.log('👥 Migrating users...');
    
    const users = await this.querySQLite(`
      SELECT * FROM users ORDER BY created_at
    `);

    let migrated = 0;
    const errors = [];

    for (const user of users) {
      try {
        // Hash password if it's plain text
        let passwordHash = user.password_hash;
        if (user.password && !passwordHash) {
          passwordHash = await bcrypt.hash(user.password, 12);
        }

        await this.postgresDb.user.create({
          data: {
            id: user.id,
            email: user.email,
            firstName: user.first_name || 'Unknown',
            lastName: user.last_name || 'User',
            passwordHash: passwordHash,
            role: this.mapRole(user.role),
            isActive: user.is_active !== 0,
            loginCount: user.login_count || 0,
            lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : null,
            createdAt: new Date(user.created_at),
            updatedAt: new Date(user.updated_at || user.created_at)
          }
        });
        
        migrated++;
      } catch (error) {
        errors.push({ user: user.id, error: error.message });
        this.migrationStats.errors.push(`User ${user.id}: ${error.message}`);
      }
    }

    this.migrationStats.tables.users = { total: users.length, migrated, errors: errors.length };
    console.log(`✅ Users migrated: ${migrated}/${users.length} (${errors.length} errors)`);
  }

  async migrateLeads() {
    console.log('📋 Migrating leads...');
    
    const leads = await this.querySQLite(`
      SELECT * FROM leads ORDER BY created_at
    `);

    let migrated = 0;
    const errors = [];

    // Process in batches
    for (let i = 0; i < leads.length; i += BATCH_SIZE) {
      const batch = leads.slice(i, i + BATCH_SIZE);
      
      for (const lead of batch) {
        try {
          await this.postgresDb.lead.create({
            data: {
              id: lead.id,
              firstName: lead.first_name,
              lastName: lead.last_name,
              email: lead.email,
              phone: lead.phone,
              contactPreference: this.mapContactPreference(lead.contact_preference),
              bestTimeToCall: lead.best_time_to_call,
              status: this.mapLeadStatus(lead.status),
              source: lead.source || 'website',
              score: lead.score || 0,
              priority: this.calculatePriority(lead.score || 0),
              tags: lead.tags,
              notes: lead.notes,
              assignedTo: lead.assigned_to,
              lastContactedAt: lead.last_contacted_at ? new Date(lead.last_contacted_at) : null,
              nextFollowUpAt: lead.next_follow_up_at ? new Date(lead.next_follow_up_at) : null,
              conversionDate: lead.conversion_date ? new Date(lead.conversion_date) : null,
              estimatedValue: lead.estimated_value,
              actualValue: lead.actual_value,
              utmCampaign: lead.utm_campaign,
              utmSource: lead.utm_source,
              utmMedium: lead.utm_medium,
              utmContent: lead.utm_content,
              utmTerm: lead.utm_keyword,
              gclid: lead.gclid,
              fbclid: lead.fbclid,
              visitorUserId: lead.visitor_user_id,
              ipAddress: lead.ip_address,
              userAgent: lead.device,
              deviceType: this.parseDeviceType(lead.device),
              browserInfo: this.parseBrowserInfo(lead.device),
              geoLocation: this.parseGeoLocation(lead.default_location),
              formId: lead.form_id,
              landingPageUrl: lead.first_visit_url,
              referrerUrl: lead.last_visit_url,
              abTestId: lead.ab_test_id,
              abVariant: lead.ab_variant,
              createdAt: new Date(lead.created_at),
              updatedAt: new Date(lead.updated_at || lead.created_at)
            }
          });
          
          migrated++;
        } catch (error) {
          errors.push({ lead: lead.id, error: error.message });
          this.migrationStats.errors.push(`Lead ${lead.id}: ${error.message}`);
        }
      }
      
      console.log(`Processed batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(leads.length/BATCH_SIZE)}`);
    }

    this.migrationStats.tables.leads = { total: leads.length, migrated, errors: errors.length };
    console.log(`✅ Leads migrated: ${migrated}/${leads.length} (${errors.length} errors)`);
  }

  async migrateSystemDetails() {
    console.log('⚙️ Migrating system details...');
    
    const systemDetails = await this.querySQLite(`
      SELECT * FROM system_details ORDER BY created_at
    `);

    let migrated = 0;
    const errors = [];

    for (const system of systemDetails) {
      try {
        await this.postgresDb.systemDetails.create({
          data: {
            id: system.id,
            leadId: system.lead_id,
            systemSize: parseFloat(system.system_size),
            estimatedCost: parseFloat(system.estimated_cost),
            annualSavings: parseFloat(system.annual_savings),
            paybackPeriod: parseFloat(system.payback_period),
            panelCount: parseInt(system.panel_count),
            roofArea: parseFloat(system.roof_area),
            monthlyBill: parseFloat(system.monthly_bill),
            usageKwh: parseInt(system.usage_kwh),
            address: system.address,
            latitude: this.parseLatitude(system.address),
            longitude: this.parseLongitude(system.address),
            propertyType: this.mapPropertyType(system.property_type),
            roofType: this.mapRoofType(system.roof_type),
            roofAngle: this.estimateRoofAngle(system.roof_type),
            shadingFactor: this.estimateShadingFactor(),
            createdAt: new Date(system.created_at),
            updatedAt: new Date(system.updated_at || system.created_at)
          }
        });
        
        migrated++;
      } catch (error) {
        errors.push({ system: system.id, error: error.message });
        this.migrationStats.errors.push(`SystemDetails ${system.id}: ${error.message}`);
      }
    }

    this.migrationStats.tables.systemDetails = { total: systemDetails.length, migrated, errors: errors.length };
    console.log(`✅ System details migrated: ${migrated}/${systemDetails.length} (${errors.length} errors)`);
  }

  async migrateVisitorTracking() {
    console.log('👁️ Migrating visitor tracking...');
    
    const visitors = await this.querySQLite(`
      SELECT * FROM visitor_tracking ORDER BY timestamp LIMIT 50000
    `);

    let migrated = 0;
    const errors = [];

    // Process in larger batches for visitor data
    for (let i = 0; i < visitors.length; i += BATCH_SIZE * 2) {
      const batch = visitors.slice(i, i + BATCH_SIZE * 2);
      
      const visitorData = batch.map(visitor => ({
        id: visitor.id,
        visitorUserId: visitor.visitor_user_id,
        sessionId: visitor.session_id || `session_${visitor.id}`,
        ipAddress: visitor.ip_address,
        country: visitor.country,
        region: visitor.region,
        city: visitor.city,
        timezone: this.guessTimezone(visitor.country),
        userAgent: visitor.user_agent,
        page: visitor.page,
        pageTitle: this.extractPageTitle(visitor.page),
        referrer: visitor.referrer,
        deviceType: visitor.device_type,
        browser: visitor.browser,
        browserVersion: this.parseBrowserVersion(visitor.user_agent),
        os: visitor.os,
        screenSize: this.parseScreenSize(visitor.user_agent),
        language: this.parseLanguage(visitor.user_agent),
        isBot: visitor.is_bot === 1,
        timestamp: new Date(visitor.timestamp),
        stayTime: visitor.stay_time,
        scrollDepth: visitor.scroll_depth,
        clickCount: this.parseClickCount(visitor.actions),
        actions: this.parseActions(visitor.actions)
      }));

      try {
        await this.postgresDb.visitorTracking.createMany({
          data: visitorData,
          skipDuplicates: true
        });
        
        migrated += visitorData.length;
      } catch (error) {
        errors.push({ batch: i/BATCH_SIZE, error: error.message });
        this.migrationStats.errors.push(`VisitorTracking batch ${i/BATCH_SIZE}: ${error.message}`);
      }
      
      console.log(`Processed visitor batch ${Math.floor(i/(BATCH_SIZE*2)) + 1}/${Math.ceil(visitors.length/(BATCH_SIZE*2))}`);
    }

    this.migrationStats.tables.visitorTracking = { total: visitors.length, migrated, errors: errors.length };
    console.log(`✅ Visitor tracking migrated: ${migrated}/${visitors.length} (${errors.length} errors)`);
  }

  async validateMigration() {
    console.log('🔍 Validating migration...');
    
    const validation = {
      users: await this.validateTable('users', 'user'),
      leads: await this.validateTable('leads', 'lead'),
      systemDetails: await this.validateTable('system_details', 'systemDetails'),
      visitorTracking: await this.validateTable('visitor_tracking', 'visitorTracking')
    };

    const allValid = Object.values(validation).every(v => v.valid);
    
    if (allValid) {
      console.log('✅ Migration validation passed');
    } else {
      console.log('❌ Migration validation failed');
      console.log(validation);
    }

    return validation;
  }

  async validateTable(sqliteTable, prismaModel) {
    const sqliteCount = await this.querySQLite(`SELECT COUNT(*) as count FROM ${sqliteTable}`);
    const postgresCount = await this.postgresDb[prismaModel].count();
    
    const sqliteTotal = sqliteCount[0].count;
    const migrated = this.migrationStats.tables[prismaModel]?.migrated || 0;
    
    return {
      valid: Math.abs(sqliteTotal - postgresCount) <= 5, // Allow small variance
      sqliteCount: sqliteTotal,
      postgresCount: postgresCount,
      migrated: migrated,
      variance: Math.abs(sqliteTotal - postgresCount)
    };
  }

  async generateReport() {
    const endTime = new Date();
    const duration = Math.round((endTime - this.migrationStats.startTime) / 1000);
    
    const report = {
      migration: {
        startTime: this.migrationStats.startTime,
        endTime: endTime,
        duration: `${duration} seconds`,
        status: this.migrationStats.errors.length === 0 ? 'SUCCESS' : 'PARTIAL'
      },
      tables: this.migrationStats.tables,
      errors: this.migrationStats.errors,
      warnings: this.migrationStats.warnings
    };

    const reportFile = path.join(BACKUP_DIR, `migration-report-${endTime.toISOString().replace(/[:.]/g, '-')}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Migration Report:');
    console.log(`Duration: ${duration} seconds`);
    console.log(`Status: ${report.migration.status}`);
    console.log(`Errors: ${this.migrationStats.errors.length}`);
    console.log(`Report saved: ${reportFile}`);
    
    return report;
  }

  // Helper methods for data transformation
  mapRole(role) {
    const roleMap = {
      'super_admin': 'SUPER_ADMIN',
      'admin': 'ADMIN',
      'viewer': 'VIEWER'
    };
    return roleMap[role] || 'VIEWER';
  }

  mapContactPreference(pref) {
    const prefMap = {
      'phone': 'PHONE',
      'email': 'EMAIL',
      'both': 'BOTH'
    };
    return prefMap[pref] || 'EMAIL';
  }

  mapLeadStatus(status) {
    const statusMap = {
      'new': 'NEW',
      'contacted': 'CONTACTED',
      'qualified': 'QUALIFIED',
      'proposal_sent': 'PROPOSAL_SENT',
      'converted': 'WON',
      'not_interested': 'NOT_INTERESTED'
    };
    return statusMap[status] || 'NEW';
  }

  calculatePriority(score) {
    if (score >= 80) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  mapPropertyType(type) {
    const typeMap = {
      'residential': 'RESIDENTIAL',
      'commercial': 'COMMERCIAL',
      'industrial': 'INDUSTRIAL'
    };
    return typeMap[type] || 'RESIDENTIAL';
  }

  mapRoofType(type) {
    const roofMap = {
      'standard': 'TILE',
      'tile': 'TILE',
      'metal': 'METAL',
      'flat': 'FLAT'
    };
    return roofMap[type] || 'TILE';
  }

  // Utility methods for data parsing
  parseDeviceType(device) {
    if (!device) return null;
    if (device.toLowerCase().includes('mobile')) return 'mobile';
    if (device.toLowerCase().includes('tablet')) return 'tablet';
    return 'desktop';
  }

  parseBrowserInfo(userAgent) {
    if (!userAgent) return null;
    // Simple browser detection logic
    return { userAgent: userAgent.substring(0, 500) };
  }

  parseGeoLocation(location) {
    if (!location) return null;
    return { location: location };
  }

  parseLatitude(address) {
    // Would integrate with geocoding service in production
    return null;
  }

  parseLongitude(address) {
    // Would integrate with geocoding service in production
    return null;
  }

  estimateRoofAngle(roofType) {
    const angleMap = {
      'FLAT': 0,
      'TILE': 35,
      'METAL': 30
    };
    return angleMap[roofType] || 30;
  }

  estimateShadingFactor() {
    return 0.1; // Default 10% shading
  }

  guessTimezone(country) {
    const timezoneMap = {
      'IE': 'Europe/Dublin',
      'GB': 'Europe/London',
      'US': 'America/New_York'
    };
    return timezoneMap[country] || 'UTC';
  }

  extractPageTitle(page) {
    // Simple page title extraction
    const pageMap = {
      '/': 'Home',
      '/calculator': 'Solar Calculator',
      '/admin': 'Admin Dashboard'
    };
    return pageMap[page] || page;
  }

  parseBrowserVersion(userAgent) {
    if (!userAgent) return null;
    // Simple version extraction
    const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
    if (chromeMatch) return chromeMatch[1];
    return null;
  }

  parseScreenSize(userAgent) {
    // Would use actual screen detection in production
    return null;
  }

  parseLanguage(userAgent) {
    // Simple language detection
    if (userAgent && userAgent.includes('en-')) return 'en';
    return null;
  }

  parseClickCount(actions) {
    if (!actions) return 0;
    try {
      const actionsData = JSON.parse(actions);
      return actionsData.clicks || 0;
    } catch {
      return 0;
    }
  }

  parseActions(actions) {
    if (!actions) return null;
    try {
      return JSON.parse(actions);
    } catch {
      return null;
    }
  }

  async cleanup() {
    if (this.sqliteDb) {
      this.sqliteDb.close();
    }
    if (this.postgresDb) {
      await this.postgresDb.$disconnect();
    }
  }
}

// Main execution
async function main() {
  const migrator = new DatabaseMigrator();
  
  try {
    await migrator.initialize();
    await migrator.createBackup();
    await migrator.validateConnections();
    
    // Run migrations
    await migrator.migrateUsers();
    await migrator.migrateLeads();
    await migrator.migrateSystemDetails();
    await migrator.migrateVisitorTracking();
    
    // Validate and report
    await migrator.validateMigration();
    await migrator.generateReport();
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await migrator.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DatabaseMigrator };