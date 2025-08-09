# PatchMe Docker Setup

PatchMe ist ein System-Monitoring-Tool, das als Docker-Container bereitgestellt wird.

## Schnellstart

### Option 1: Mit vorkompiliertem Image (Empfohlen)

```bash
# Repository klonen
git clone <your-repo-url>
cd patchme

# Mit vorkompiliertem Image starten
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Selbst kompilieren

```bash
# Repository klonen
git clone <your-repo-url>
cd patchme

# Selbst bauen und starten
docker-compose up -d --build
```

## Zugriff

Nach dem Start ist PatchMe unter folgender Adresse erreichbar:
- **Web-Interface**: http://localhost:3000
- **API**: http://localhost:3000/api

## Standard-Zugangsdaten

Die Seed-Daten erstellen einen Standard-Admin-Benutzer:
- **Benutzername**: admin@example.com
- **Passwort**: admin123

⚠️ **Wichtig**: Ändere das Passwort nach der ersten Anmeldung!

## Konfiguration

### Umgebungsvariablen

Erstelle eine `.env`-Datei oder passe die Umgebungsvariablen in `docker-compose.yml` an:

```env
DATABASE_URL=mysql://patchme:patchme@db:3306/patchme
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### Datenbank-Einstellungen

Standardmäßig wird eine MySQL 8.0 Datenbank verwendet. Die Konfiguration findest du in der `docker-compose.yml`:

- **Datenbank**: patchme
- **Benutzer**: patchme
- **Passwort**: patchme
- **Root-Passwort**: rootpassword

## Volumes

- `mysql_data`: Persistente Speicherung der MySQL-Datenbank

## Ports

- **3000**: Web-Interface und API
- **3306**: MySQL-Datenbank (optional für externe Zugriffe)

## Wartung

### Logs anzeigen

```bash
# Alle Services
docker-compose logs

# Nur App
docker-compose logs app

# Nur Datenbank
docker-compose logs db
```

### Container neustarten

```bash
docker-compose restart
```

### Datenbank zurücksetzen

```bash
docker-compose down -v
docker-compose up -d
```

### Updates

```bash
# Bei vorkompiliertem Image
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Bei selbst kompiliertem Image
docker-compose down
docker-compose up -d --build
```

## Sicherheit

Für Production-Umgebungen:

1. **JWT_SECRET** ändern
2. **Datenbank-Passwörter** ändern
3. **Admin-Passwort** nach erstem Login ändern
4. **Firewall-Regeln** für Port 3306 setzen (falls nicht benötigt)

## Backup

### Datenbank-Backup

```bash
docker-compose exec db mysqldump -u patchme -ppatchme patchme > backup.sql
```

### Datenbank-Restore

```bash
docker-compose exec -i db mysql -u patchme -ppatchme patchme < backup.sql
```

## Troubleshooting

### Container startet nicht

```bash
# Status prüfen
docker-compose ps

# Logs prüfen
docker-compose logs

# Neu starten
docker-compose down
docker-compose up -d
```

### Datenbank-Verbindungsfehler

1. Warte bis MySQL vollständig gestartet ist (kann 30-60 Sekunden dauern)
2. Prüfe die DATABASE_URL
3. Stelle sicher, dass der `db`-Container läuft

### Performance-Probleme

Erhöhe die verfügbaren Ressourcen in Docker Desktop oder deinem Docker-Host.

## Support

Bei Problemen erstelle ein Issue im Repository oder kontaktiere das Entwicklerteam.