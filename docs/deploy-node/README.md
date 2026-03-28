# Deploying without Docker (Manual Setup)

The following instructions guide you through manually deploying and managing the
Node.js application on an Ubuntu based server. You can use these steps to set up
the application without using Docker or automated scripts. The scripts provided
were originally designed for setting up an AWS EC2 instance but can be adapted
for any Ubuntu server environment.

**NOTE**: These scripts are provided as-is for educational purposes. They are no
longer actively maintained or updated, and they may not reflect current best
practices, software versions, or security standards. Use them at your own risk
and ensure that you adapt them to your specific server. If you choose to use
these scripts and make improvements, contributions are welcome.

This configuration uses the following technology stack:
- Web Server: nginx as a reverse proxy server
- Backend Runtime: Node.js
- Backend Framework: Express
- Process Manager: pm2 for managing the Node.js application process

## Initial Configuration Scripts

The scripts listed below should be run in the order shown below to set up a new
Ubuntu installation for hosting a node.js application with a nginx acting as a
reverse proxy. You only need to run these scripts **once** during the initial
setup.

**IMPORTANT**: If you encounter any issues log out of your SSH session and log
back in after running each script to ensure that all environment variables are
loaded correctly.

- `install-packages.sh`: A script to install necessary packages for the project.
- `config-nginx.sh`: A script to configure Nginx as a reverse proxy for the Node.js application.
- `config-node.sh`: A script to set up the Node.js application with pm2.


## Running the Node.js application with pm2 on startup

- `start-app`: A script to start the Node.js application using pm2. This script
  assumes that the necessary packages have already been installed, and the
  application has been configured. It can be used to start the application after a
  server reboot or code deployment.
- Confirm that the application is running by checking the pm2 process list:
  ```bash
  pm2 list
  ```
- Check that the application is accessible via the server's public IP. If you have
  configured Nginx correctly, you should be able to access the application in a
  web browser using the server's public IP address.
- Configure your application to automatically start on server reboot by
  following the instructions in the [Generating a Startup Script](https://pm2.keymetrics.io/docs/usage/startup/).

## Updating the application code

To update the application code on the EC2 instance after making changes to
the repository, follow these steps:
- SSH into your EC2 instance.
- Navigate to the cloned repository directory
- Make sure you are in the `scripts` directory
- Run `start-app.sh` to pull the latest changes from the repository and restart
  the Node.js application using pm2.

## Troubleshooting

If you encounter any issues it will likely be related to your code. Nginx and
pm2 are generally reliable once set up correctly, so as long as you have followed
the setup instructions carefully, and you got the application running once, the
setup should be solid.

- Check the pm2 logs for the Node.js application to see if there are any errors:
  ```bash
  pm2 logs nodeapp
  ```
- Instead of running `start-app.sh`, you can run through all the commands manually
  in the script to see where the issue might be. Open up the `start-app.sh` script
  and run each command one at a time in the terminal to identify any errors.
- Don't treat the setup scripts as black boxes. Open them up and read through
  what each command does so you understand how the setup works. This will help
  you troubleshoot issues more effectively.

## Manual management of the Node.js application with pm2

If you need to troubleshoot or manually manage the Node.js application, you can
use pm2 commands directly.

After setting up the EC2 instance, you can start the Node.js application using pm2.
- Use the command `pm2 start ./bin/www --name "nodeapp" --watch` to start the application.
- Use `pm2 list` to see the running applications.
- Use `pm2 restart nodeapp` to restart the application if needed.
- Use `pm2 stop nodeapp` to stop the application.
- Use `pm2 delete nodeapp` to remove the application from pm2 management.
- Use `pm2 logs nodeapp` to view the application logs for troubleshooting.