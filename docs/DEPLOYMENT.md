# JerseyNexus - Deployment Guide

## 🚀 Production Deployment

### Server Requirements
- Node.js 18+
- PostgreSQL 14+
- Nginx (recommended for reverse proxy)
- SSL certificate
- 2GB+ RAM
- 20GB+ storage

## 🛠️ Deployment Steps

### 1. Server Setup

#### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2 for process management
npm install -g pm2
```

#### Database Setup
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE jerseynexus;
CREATE USER jerseynexus_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE jerseynexus TO jerseynexus_user;
\\q
```

### 2. Application Deployment

#### Clone Repository
```bash
git clone https://github.com/yourusername/jerseynexus.git
cd jerseynexus
```

#### Environment Configuration

**Backend (.env)**
```env
DATABASE_URL="postgresql://jerseynexus_user:secure_password@localhost:5432/jerseynexus"
JWT_SECRET="your-super-secure-jwt-secret-change-this"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=production
CORS_ORIGIN="https://jerseynexus.com,https://admin.jerseynexus.com"
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
ADMIN_EMAIL="admin@jerseynexus.com"
ADMIN_PASSWORD="Change-This-Admin-Password"
```

**Frontend (.env.production)**
```env
VITE_API_URL=https://api.jerseynexus.com/api
VITE_APP_NAME=JerseyNexus
```

#### Install & Build
```bash
# Install dependencies
npm run install:all

# Build applications
npm run build

# Setup database
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 3. Process Management with PM2

#### Create PM2 Ecosystem File
**ecosystem.config.js**
```javascript
module.exports = {
  apps: [
    {
      name: 'jerseynexus-api',
      script: './backend/src/index.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    }
  ]
};
```

#### Start with PM2
```bash
# Create logs directory
mkdir logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### 4. Nginx Configuration

#### Main Site (/etc/nginx/sites-available/jerseynexus)
```nginx
server {
    listen 80;
    server_name jerseynexus.com www.jerseynexus.com;
    
    root /var/www/jerseynexus/frontend/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location /uploads {
        alias /var/www/jerseynexus/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Frontend routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Admin Dashboard (/etc/nginx/sites-available/jerseynexus-admin)
```nginx
server {
    listen 80;
    server_name admin.jerseynexus.com;
    
    root /var/www/jerseynexus/admin/dist;
    index index.html;
    
    # Same security and performance settings as main site
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Enable Sites
```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/jerseynexus /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/jerseynexus-admin /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5. SSL Setup with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d jerseynexus.com -d www.jerseynexus.com
sudo certbot --nginx -d admin.jerseynexus.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 6. Monitoring & Logging

#### Setup Log Rotation
**/etc/logrotate.d/jerseynexus**
```
/var/www/jerseynexus/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### Monitoring with PM2
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart app
pm2 restart jerseynexus-api

# Check status
pm2 status
```

### 7. Database Backup

#### Automated Backup Script
**/home/user/backup.sh**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/jerseynexus"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U jerseynexus_user jerseynexus > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

#### Setup Cron Job
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/user/backup.sh >> /var/log/backup.log 2>&1
```

### 8. Security Considerations

#### Firewall Setup
```bash
# Install UFW
sudo apt install ufw

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

#### Additional Security
- Regular security updates
- Database connection from application only
- Strong passwords for all accounts
- Regular backup testing
- Monitor logs for suspicious activity
- Rate limiting on Nginx level

### 9. Performance Optimization

#### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
```

#### Redis for Caching (Optional)
```bash
# Install Redis
sudo apt install redis-server

# Configure in application for session storage and caching
```

### 10. Domain & DNS Setup

#### DNS Records
```
Type    Name    Value               TTL
A       @       your_server_ip      3600
A       www     your_server_ip      3600
A       admin   your_server_ip      3600
```

## 📊 Health Checks

Create monitoring endpoints and setup external monitoring services like:
- UptimeRobot
- Pingdom
- New Relic

## 🔧 Maintenance

### Regular Tasks
- Monitor PM2 processes
- Check disk space
- Review error logs
- Update dependencies
- Security patches
- Database cleanup
- Backup verification

### Updates
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm run install:all

# Run migrations
npm run db:migrate

# Build applications
npm run build

# Restart services
pm2 restart all
```

This deployment guide ensures a production-ready, secure, and scalable deployment of JerseyNexus.