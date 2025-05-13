#!/bin/bash
echo "🚀 Deploying application..."

# Add GitHub CLI repository
type -p curl >/dev/null || (sudo apt update && sudo apt install curl -y)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
&& sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null

# Install GitHub CLI
sudo apt update
sudo apt install gh -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Create application directory
sudo mkdir -p /var/www/drops-backend
cd /var/www/drops-backend

# Authenticate with GitHub (you'll need to follow the prompts)
gh auth login

# Clone the repository using GitHub CLI
gh repo clone RafikBENKHADEMyassir/drops_backend .

# Create uploads and public directories
mkdir -p uploads/profiles
mkdir -p public
chmod 755 uploads uploads/profiles public

# Copy the coming soon page to public directory
cp public/index.html /var/www/drops-backend/public/

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

# Setup HTTPS with Let's Encrypt
echo "Setting up HTTPS..."
bash setup-https.sh