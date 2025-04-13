#!/bin/bash
echo "🚀 Deploying application..."

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Create uploads directories
mkdir -p uploads/profiles
chmod 755 uploads uploads/profiles

# Install dependencies
npm install

# Build the application
npm run build

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/drops-backend
sudo ln -s /etc/nginx/sites-available/drops-backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list and configure to start on system startup
pm2 save
pm2 startup