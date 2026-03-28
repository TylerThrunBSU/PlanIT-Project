#!/bin/bash
# This script installs the necessary dependencies on an EC2 instance.
sudo apt-get update
sudo apt-get install -y nodejs npm
sudo apt install curl build-essential libssl-dev -y
sudo apt-get install -y nginx


# Install pm2 to manage the Node.js application
sudo npm install -g pm2

# Install node version manager (nvm) and use it to install a specific Node.js version
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

echo "Installation script completed. You MUST exit and re-login to refresh your environment for nvm to work."