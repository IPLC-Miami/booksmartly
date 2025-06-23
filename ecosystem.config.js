module.exports = {
  apps: [{
    name: 'booksmartly-backend',
    script: 'backend/app.js',
    cwd: '/var/www/booksmartly',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8000
    }
  }]
};