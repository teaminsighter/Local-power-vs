module.exports = {
  apps: [
    {
      name: 'local-power-dev',
      script: 'node_modules/.bin/next',
      args: 'dev -p 3002',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
