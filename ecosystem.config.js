/**
 * PM2 Ecosystem Configuration for Production
 * Optimized for performance and reliability
 */

module.exports = {
  apps: [{
    name: 'localpower-prod',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/localpower',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Override any development settings
      NEXT_TELEMETRY_DISABLED: 1
    },
    
    // Logging configuration
    log_type: 'json',
    error_file: '/var/log/localpower/error.log',
    out_file: '/var/log/localpower/out.log',
    log_file: '/var/log/localpower/combined.log',
    time: true,
    
    // Performance settings
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    
    // Health monitoring
    min_uptime: '10s',
    max_restarts: 5,
    
    // Auto-restart configuration
    watch: false, // Disable in production
    ignore_watch: ['node_modules', 'logs', '.git'],
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Source maps for better error tracking
    source_map_support: true,
    
    // Merge logs from all instances
    merge_logs: true,
    
    // Cron restart (optional - restart daily at 3 AM)
    cron_restart: '0 3 * * *',
    
    // Instance variables
    instance_var: 'INSTANCE_ID'
  }],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'root',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'https://github.com/yourusername/local-power.git',
      path: '/var/www/localpower',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};