// Edit your ecosystem.config.js
module.exports = {
  apps: [{
    name: "drops-backend",
    script: "./dist/index.js",
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    env_production: {
      NODE_ENV: "production"
    },
    // Add this option to allow multiple instances to share the same port
    listen_timeout: 50000,
    kill_timeout: 5000
  }]
}