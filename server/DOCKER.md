# Docker Setup Guide

This guide explains how to run the Navayuga backend server using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose 2.0 or later

## Quick Start

1. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your configuration:
   - Set MongoDB credentials (or use defaults)
   - Add AWS S3 credentials (if using file uploads)
   - Configure email settings (if using email notifications)
   - Set JWT_SECRET (important for production!)

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Check if services are running:**
   ```bash
   docker-compose ps
   ```

5. **View application logs:**
   ```bash
   docker-compose logs -f app
   ```

6. **View MongoDB logs:**
   ```bash
   docker-compose logs -f mongodb
   ```

## Services

### MongoDB
- **Container name:** `navayuga-mongodb`
- **Port:** `27017` (exposed to host)
- **Data persistence:** Stored in Docker volumes (`mongodb_data` and `mongodb_config`)
- **Default credentials:**
  - Username: `admin`
  - Password: `admin123`
  - Database: `navayuga`

### Application
- **Container name:** `navayuga-app`
- **Port:** `3000` (exposed to host)
- **Health check:** Enabled (checks every 30 seconds)

## Environment Variables

Key environment variables (set in `.env` file):

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_ROOT_USERNAME` | MongoDB root username | `admin` |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | `admin123` |
| `MONGO_DATABASE` | Database name | `navayuga` |
| `MONGO_PORT` | MongoDB host port | `27017` |
| `JWT_SECRET` | JWT secret key | `navayuga_jwt_secret_key_change_in_production` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment | `production` |

## Common Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes all data)
```bash
docker-compose down -v
```

### Rebuild application
```bash
docker-compose build app
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Application only
docker-compose logs -f app

# MongoDB only
docker-compose logs -f mongodb
```

### Execute commands in container
```bash
# Access application container shell
docker-compose exec app sh

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

### Restart a service
```bash
docker-compose restart app
docker-compose restart mongodb
```

## Data Persistence

MongoDB data is stored in Docker volumes:
- `mongodb_data`: Database files
- `mongodb_config`: Configuration files

To backup data:
```bash
docker-compose exec mongodb mongodump --out /data/backup --username admin --password admin123 --authenticationDatabase admin
```

To restore data:
```bash
docker-compose exec mongodb mongorestore /data/backup --username admin --password admin123 --authenticationDatabase admin
```

## Network

Both services run on a custom bridge network (`navayuga-network`). The application connects to MongoDB using the service name `mongodb` as the hostname.

## Troubleshooting

### Application won't start
1. Check logs: `docker-compose logs app`
2. Verify MongoDB is healthy: `docker-compose ps`
3. Check environment variables in `.env`

### MongoDB connection issues
1. Verify MongoDB is running: `docker-compose ps mongodb`
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify credentials in `.env` match MongoDB environment variables

### Port already in use
If port 3000 or 27017 is already in use, you can change them in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change host port to 3001
```

### Rebuild after code changes
```bash
docker-compose build app
docker-compose up -d
```

## Production Considerations

1. **Change default passwords:** Update `MONGO_ROOT_PASSWORD` and `JWT_SECRET` in `.env`
2. **Use secrets management:** Consider using Docker secrets or a secrets manager
3. **Enable SSL/TLS:** Configure MongoDB with SSL/TLS for production
4. **Backup strategy:** Set up regular MongoDB backups
5. **Resource limits:** Add resource limits in `docker-compose.yml`:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```
6. **Health checks:** Already configured, but monitor them
7. **Logging:** Configure log rotation and aggregation

## Development vs Production

For development, you might want to:
- Mount source code as a volume for hot reload
- Use nodemon for auto-restart
- Enable debug logging

For production:
- Use the current setup (build in Docker)
- Set `NODE_ENV=production`
- Use proper secrets management
- Enable monitoring and alerting

