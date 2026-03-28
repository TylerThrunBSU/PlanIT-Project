#!/bin/bash
# This script configures nginx as a reverse proxy to serve a Node.js application
# on an EC2 instance. The Node.js application is assumed to be running on localhost:3000.


# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Nginx is not installed."
    echo "Please run the install-packages.sh script to install nginx."
    exit 1

else
    echo "Nginx is installed continuing with configuration..."
fi

# Enable nginx to start on boot
sudo systemctl enable nginx

# Stop nginx if it is running
sudo systemctl stop nginx

# Create a new nginx configuration file for the Node.js application
NGINX_CONF="/etc/nginx/sites-available/nodeapp"
sudo bash -c "cat > $NGINX_CONF" <<EOL
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_intercept_errors on;

        error_page 502 503 504 /app_unavailable.html;
        location = /app_unavailable.html {
            root /var/www/html/;
            internal;
        }
    }
}
EOL

# Copy a simple HTML file to show when the app is unavailable
sudo cp ./app_unavailable.html /var/www/html/app_unavailable.html

# Enable the new configuration by creating a symbolic link
sudo ln -s $NGINX_CONF /etc/nginx/sites-enabled/

# Remove the default nginx configuration
sudo rm /etc/nginx/sites-enabled/default

# Test the nginx configuration for syntax errors
sudo nginx -t

# Reload nginx to apply the new configuration
sudo systemctl reload nginx
# Start nginx
sudo systemctl start nginx

# Ensure nginx is running
sudo systemctl status nginx --no-pager
echo "Nginx has been configured to serve the Node.js application."
