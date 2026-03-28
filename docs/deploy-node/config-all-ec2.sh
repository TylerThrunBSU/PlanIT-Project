#!/bin/bash
echo "Configuring EC2 instance..."
# Update server packages with install-packages.sh
bash ./install-packages.sh
# Config the reverse proxy with nginx
bash ./config-nginx.sh
# Config node application with pm2
bash ./config-node.sh
# Start the application
bash ./start-app.sh
