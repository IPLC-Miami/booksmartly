module.exports = {
  apps: [{
    name: 'booksmartly',
    script: 'index.js',
    cwd: '/var/www/booksmartly',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};