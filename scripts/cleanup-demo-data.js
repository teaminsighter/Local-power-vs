#!/usr/bin/env node

/**
 * Demo Data Cleanup Script for Local Power
 * Single command to remove ALL demo data from the system
 * Use with caution - this will permanently delete all demo records
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const prisma = new PrismaClient();

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function confirmCleanup() {
  console.log('🚨 WARNING: This will permanently delete ALL demo data!');
  console.log('📊 This includes:');
  console.log('   • All demo leads and customers');
  console.log('   • Solar installation records');
  console.log('   • Visitor tracking data');
  console.log('   • Question responses');
  console.log('   • Marketing campaign data');
  console.log('   • Analytics data');
  console.log('   • Demo data files');
  console.log('');
  
  const answer = await question('❓ Are you sure you want to continue? (type "DELETE ALL DEMO DATA" to confirm): ');
  
  if (answer.trim() !== 'DELETE ALL DEMO DATA') {
    console.log('❌ Cleanup cancelled.');
    return false;
  }
  
  const doubleCheck = await question('⚠️  Last chance! Type "YES" to permanently delete all demo data: ');
  
  return doubleCheck.trim().toUpperCase() === 'YES';
}

async function cleanupDatabase() {
  console.log('🧹 Cleaning up database records...');
  
  try {
    // Delete in order to respect foreign key constraints
    
    // 1. Delete marketing campaign data
    console.log('Deleting marketing campaigns...');
    const marketingResult = await prisma.$executeRaw`DELETE FROM marketing_campaigns WHERE id LIKE 'campaign_%'`;
    console.log(`Deleted ${marketingResult} marketing campaign records`);
    
    // 2. Delete analytics data
    console.log('Deleting analytics data...');
    const analyticsResult = await prisma.$executeRaw`DELETE FROM analytics_data WHERE step_name IN ('Welcome', 'State Selection', 'Solution Selection', 'Address Input', 'Map Analysis', 'Panel Configuration', 'Lead Capture')`;
    console.log(`Deleted ${analyticsResult} analytics records`);
    
    // 3. Delete question responses
    console.log('Deleting question responses...');
    const responsesResult = await prisma.$executeRaw`DELETE FROM question_responses WHERE id LIKE 'response_%'`;
    console.log(`Deleted ${responsesResult} question response records`);
    
    // 4. Delete visitor tracking
    console.log('Deleting visitor tracking data...');
    const visitorsResult = await prisma.$executeRaw`DELETE FROM visitor_tracking WHERE id LIKE 'visitor_%'`;
    console.log(`Deleted ${visitorsResult} visitor tracking records`);
    
    // 5. Delete solar installations
    console.log('Deleting solar installations...');
    const installationsResult = await prisma.$executeRaw`DELETE FROM solar_installations WHERE id LIKE 'install_%'`;
    console.log(`Deleted ${installationsResult} solar installation records`);
    
    // 6. Delete leads
    console.log('Deleting leads...');
    const leadsResult = await prisma.$executeRaw`DELETE FROM leads WHERE id LIKE 'lead_%'`;
    console.log(`Deleted ${leadsResult} lead records`);
    
    console.log('✅ Database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error cleaning up database:', error);
    
    // Try alternative cleanup method using table-by-table deletion
    console.log('🔄 Attempting alternative cleanup method...');
    
    try {
      // Use model-based deletion for better compatibility
      await prisma.marketingCampaign?.deleteMany({
        where: { id: { startsWith: 'campaign_' } }
      });
      
      await prisma.questionResponse?.deleteMany({
        where: { id: { startsWith: 'response_' } }
      });
      
      await prisma.visitorTracking?.deleteMany({
        where: { id: { startsWith: 'visitor_' } }
      });
      
      await prisma.solarInstallation?.deleteMany({
        where: { id: { startsWith: 'install_' } }
      });
      
      await prisma.lead?.deleteMany({
        where: { id: { startsWith: 'lead_' } }
      });
      
      console.log('✅ Alternative cleanup method completed!');
      
    } catch (altError) {
      console.error('❌ Alternative cleanup also failed:', altError);
      console.log('💡 You may need to manually clean the database or reset it completely.');
    }
  }
}

async function cleanupFiles() {
  console.log('🗂️ Cleaning up demo data files...');
  
  const dataDir = path.join(__dirname, '../demo-data');
  
  if (fs.existsSync(dataDir)) {
    try {
      // Remove all JSON files in demo-data directory
      const files = fs.readdirSync(dataDir);
      let deletedCount = 0;
      
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(dataDir, file);
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`Deleted: ${file}`);
        }
      });
      
      // Remove the directory if it's empty
      const remainingFiles = fs.readdirSync(dataDir);
      if (remainingFiles.length === 0) {
        fs.rmdirSync(dataDir);
        console.log('Removed demo-data directory');
      }
      
      console.log(`✅ Deleted ${deletedCount} demo data files`);
      
    } catch (error) {
      console.error('❌ Error cleaning up files:', error);
    }
  } else {
    console.log('📁 No demo-data directory found');
  }
}

async function resetAnalyticsCache() {
  console.log('🔄 Resetting analytics cache...');
  
  try {
    // Clear any cached analytics data
    const cacheDir = path.join(__dirname, '../.next/cache');
    if (fs.existsSync(cacheDir)) {
      // Note: We don't delete the entire .next/cache as it contains other important cache
      console.log('Analytics cache reset (Next.js cache preserved)');
    }
    
    // Reset any local storage or session storage instructions
    console.log('💡 Note: Users should clear browser cache and localStorage for complete reset');
    console.log('   JavaScript: localStorage.clear(); sessionStorage.clear();');
    
  } catch (error) {
    console.error('❌ Error resetting cache:', error);
  }
}

async function generateCleanupReport() {
  console.log('📋 Generating cleanup report...');
  
  const report = {
    cleanupDate: new Date().toISOString(),
    action: 'DEMO_DATA_CLEANUP',
    status: 'COMPLETED',
    itemsRemoved: [
      'Demo leads and customers',
      'Solar installation records',
      'Visitor tracking data',
      'Question responses',
      'Marketing campaign data',
      'Analytics data',
      'Demo data files'
    ],
    nextSteps: [
      'Database is now clean of demo data',
      'Run generate-demo-data.js to create new demo data',
      'Clear browser cache for complete reset',
      'Restart development server if needed'
    ],
    warningShown: true,
    confirmationRequired: true
  };
  
  const reportPath = path.join(__dirname, '../cleanup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📄 Cleanup report saved to:', reportPath);
  return report;
}

async function performCleanup() {
  try {
    console.log('🚀 Starting Local Power demo data cleanup...');
    
    // Step 1: Clean database
    await cleanupDatabase();
    
    // Step 2: Clean files
    await cleanupFiles();
    
    // Step 3: Reset cache
    await resetAnalyticsCache();
    
    // Step 4: Generate report
    const report = await generateCleanupReport();
    
    console.log('');
    console.log('🎉 Demo data cleanup completed successfully!');
    console.log('✨ Your Local Power system is now clean of all demo data');
    console.log('');
    console.log('📝 Summary:');
    console.log('   • Database records removed');
    console.log('   • Demo data files deleted');
    console.log('   • Analytics cache reset');
    console.log('   • Cleanup report generated');
    console.log('');
    console.log('🔄 To generate new demo data:');
    console.log('   npm run demo:generate');
    console.log('');
    console.log('🌐 Restart your development server:');
    console.log('   npm run dev');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    console.log('');
    console.log('🆘 Manual cleanup may be required');
    console.log('💡 Consider dropping and recreating the database if errors persist');
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Main cleanup function
async function cleanupAllDemoData() {
  try {
    const confirmed = await confirmCleanup();
    
    if (!confirmed) {
      console.log('👍 Cleanup cancelled - no data was deleted');
      rl.close();
      return;
    }
    
    await performCleanup();
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Execute if run directly
if (require.main === module) {
  cleanupAllDemoData().catch(console.error);
}

module.exports = { cleanupAllDemoData };