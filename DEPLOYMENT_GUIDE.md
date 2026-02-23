# Production Deployment Guide for Multilingual AI Legal Assistant

## Introduction
This guide provides detailed instructions on deploying the multilingual AI legal assistant to production environments. It covers prerequisites, deployment steps, configuration settings, and post-deployment actions.

## Prerequisites
Before you begin, ensure the following requirements are met:

- **System Requirements:**
  - OS: Ubuntu 20.04 or later
  - CPU: Minimum 2 cores
  - RAM: Minimum 4 GB
  - Disk space: Minimum 20 GB

- **Software Dependencies:**
  - Node.js (v14.x or later)
  - Docker (latest version)
  - MongoDB (for database)

- **Access Permissions:**
  - SSH access to the server.
  - Permissions to create and manage Docker containers.

## Deployment Steps
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/subashsa1014/voluntary-consent-detector.git
   cd voluntary-consent-detector
   ```

2. **Build the Application:**
   ```bash
   npm install
   npm run build
   ```

3. **Configure Environment Variables:**
   - Rename the `.env.example` file to `.env` and adjust the settings accordingly.
   - Ensure the following variables are set:
     - `DB_URI`: MongoDB connection string.
     - `PORT`: Port on which the application will run.

4. **Database Setup:**
   - Ensure MongoDB is running, then run any necessary migrations:
   ```bash
   npm run migrate
   ```

5. **Start Services:**
   - Using Docker, run:
   ```bash
   docker-compose up -d
   ```

6. **Verify Deployment:**
   - Access the application at `http://your-server-ip:PORT`.

## Configuration Settings
### Application Settings
- **Port:** `3000`
- **Host:** `0.0.0.0`

### Database Connection
- **DB_URI:** `mongodb://user:password@localhost:27017/yourdb`

### Logging and Monitoring
- Set application logging level to `info` in the `.env` file.

### Security Considerations
- Store sensitive information such as API keys in environment variables and never hardcode them.

## Post-Deployment
1. **Testing the Deployment:**
   - Access the application through a web browser.
   - Test API endpoints using Postman or similar tools.

2. **Rollback Procedures:**
   - Keep a backup of the last stable deployment. If necessary, revert to the previous version by pulling the backup.

3. **Maintenance and Updates:**
   - Regularly update dependencies by running `npm update`.
   - Monitor application performance and Logs.
