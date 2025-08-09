# PatchMe Docker Setup

PatchMe is a system monitoring tool provided as a Docker container.

## Quick Start

### Option 1: Use Prebuilt Image (Recommended)

```bash
# Clone repository
git clone <your-repo-url>
cd patchme

# Start with prebuilt image
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Build Yourself

```bash
# Clone repository
git clone <your-repo-url>
cd patchme

# Build and start yourself
docker-compose up -d --build
```

## Access

After starting, PatchMe is available at:
- **Web Interface**: http://localhost:3000
- **API**: http://localhost:3000/api

## Default Credentials

The seed data creates a default admin user:
- **Email**: admin@patchme.local
- **Password**: admin123

⚠️ **Important**: Change the password after your first login!

## Configuration

### Environment Variables

Create a `.env` file or adjust the environment variables in `docker-compose.yml`:

```env
DATABASE_URL=mysql://patchme:patchme@db:3306/patchme
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### Database Settings

By default, a MySQL 8.0 database is used. Configuration can be found in `docker-compose.yml`:

- **Database**: patchme
- **User**: patchme
- **Password**: patchme
- **Root Password**: rootpassword

## Volumes

- `mysql_data`: Persistent storage for the MySQL database

## Ports

- **3000**: Web interface and API
- **3306**: MySQL database (optional for external access)

## Maintenance

### Show Logs

```bash
# All services
docker-compose logs

# App only
docker-compose logs app

# Database only
docker-compose logs db
```

### Restart Containers

```bash
docker-compose restart
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
```

### Updates

```bash
# With prebuilt image
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# With self-built image
docker-compose down
docker-compose up -d --build
```

## Security

For production environments:

1. Change **JWT_SECRET**
2. Change **database passwords**
3. Change **admin password** after first login
4. Set up **firewall rules** for port 3306 (if not needed externally)

## Backup

### Database Backup

```bash
docker-compose exec db mysqldump -u patchme -ppatchme patchme > backup.sql
```

### Database Restore

```bash
docker-compose exec -i db mysql -u patchme -ppatchme patchme < backup.sql
```

## Troubleshooting

### Container does not start

```bash
# Check status
docker-compose ps

# Check logs
docker-compose logs

# Restart
docker-compose down
docker-compose up -d
```

### Database connection error

1. Wait until MySQL is fully started (can take 30-60 seconds)
2. Check the DATABASE_URL
3. Make sure the `db` container is running

### Performance issues

Increase available resources in Docker Desktop or your Docker host.

## Support

If you have issues, open an issue in the repository or contact the development team.