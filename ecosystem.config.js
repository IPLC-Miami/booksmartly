module.exports = {
  apps: [{
    name: 'booksmartly-backend',
    script: 'index.js',
    cwd: '/var/www/booksmartly',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      DATABASE_URL: 'mongodb://bs_admin:bs_AdminP@ssw0rd!@localhost:27017/booksmartly'
    }
  }]
};