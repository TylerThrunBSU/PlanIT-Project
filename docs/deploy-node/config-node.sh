#!/bin/bash
# This script configures the Node.js application environment on an EC2 instance.

# ensure nvm is loaded
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Nginx is not installed."
    echo "Please run the install-packages.sh script to install nginx."
    exit 1
else
    echo "Nginx is installed continuing with configuration..."
fi

# Check if nvm is installed
if [ -z "$NVM_DIR" ]; then
    echo "nvm is not installed."
    echo "Please run the install-packages.sh script to install nvm."
    exit 1
else
    echo "nvm is installed continuing with configuration..."
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed."
    echo "Please run the install-packages.sh script to install PM2."
    exit 1
else
    echo "PM2 is installed continuing with configuration..."
fi


# Install Node.js version 24.1.0 using nvm
nvm install 24.1.0
nvm use 24.1.0
nvm alias default node

# Setup PM2 to start on boot
sudo bash -c "$(pm2 startup)"
echo "PM2 has been configured to start on boot."
