#!/bin/bash
# This will start the Node.js application using PM2 on an EC2 instance.
# Ensure that you have already configured the application using config-node.sh
# and that the application code is present on the instance.

# IF the application is already running, this will restart it.
# Otherwise, it will start it fresh.

# ensure nvm is loaded
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Ensure we are using the correct Node.js version
nvm use 24.1.0

if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed."
    echo "Please run the install-packages.sh script to install PM2."
    exit 1
else
    echo "PM2 is installed continuing with starting the application..."
fi

# Make sure and stop any existing instance of the app so we can update

if pm2 list | grep -q "nodeapp"; then
    pm2 stop nodeapp
fi


git pull origin main
pushd ../../app
npm ci
popd

# Now restart the app with PM2 or start it if not already running
if pm2 list | grep -q "nodeapp"; then
    pm2 restart nodeapp
else
    pm2 start npm --name "nodeapp" -- run start-prod
    pm2 save
fi
echo "Node.js application has been started with PM2."