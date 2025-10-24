#!/usr/bin/env node

/**
 * Security: Generate secure random secrets for environment variables
 * Run: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateNextAuthSecret() {
  return crypto.randomBytes(32).toString('base64');
}

function generateBcryptHash(password) {
  const bcrypt = require('bcryptjs');
  return bcrypt.hashSync(password, 12);
}

console.log('🔐 SECURE ENVIRONMENT SECRETS GENERATOR');
console.log('=====================================\n');

console.log('1. NEXTAUTH_SECRET (copy to your .env file):');
console.log(`NEXTAUTH_SECRET="${generateNextAuthSecret()}"`);
console.log('');

console.log('2. ENCRYPTION_KEY (for sensitive data encryption):');
console.log(`ENCRYPTION_KEY="${generateSecret(32)}"`);
console.log('');

console.log('3. WEBHOOK_SECRET (for webhook verification):');
console.log(`WEBHOOK_SECRET="${generateSecret(24)}"`);
console.log('');

console.log('4. Admin Password Hash (replace "your_secure_password" with actual password):');
try {
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('LocalPower2025!', 12);
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
} catch (error) {
  console.log('Install bcryptjs to generate password hash: npm install bcryptjs');
  console.log('ADMIN_PASSWORD_HASH="run_npm_install_bcryptjs_first"');
}
console.log('');

console.log('5. Random Session Secret:');
console.log(`SESSION_SECRET="${generateSecret(24)}"`);
console.log('');

console.log('🔒 SECURITY NOTES:');
console.log('- Never commit these secrets to git');
console.log('- Use different secrets for development and production');
console.log('- Store production secrets securely (environment variables)');
console.log('- Rotate secrets regularly in production');
console.log('');

console.log('📝 NEXT STEPS:');
console.log('1. Copy .env.example to .env.local');
console.log('2. Replace placeholder values with secrets above');
console.log('3. Add your actual API keys');
console.log('4. Never commit .env.local or .env.production to git');