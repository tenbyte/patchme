#!/bin/bash
set -euo pipefail
DOMAIN="https://yourdomain.com"
KEY="pm_XXXXX"
NC_PATH="/var/www/nextcloud"

# PHP version
PHP_VERSION=$(php -r "echo PHP_VERSION;" 2>/dev/null || true)

# MySQL/MariaDB version (reported under "Mysql_Version")
if command -v mysql >/dev/null 2>&1; then
  MYSQL_VERSION=$(mysql --version 2>/dev/null | grep -oP "[0-9]+\.[0-9]+\.[0-9]+" | head -n1 || true)
elif command -v mariadb >/dev/null 2>&1; then
  MYSQL_VERSION=$(mariadb --version 2>/dev/null | grep -oP "[0-9]+\.[0-9]+\.[0-9]+" | head -n1 || true)
else
  MYSQL_VERSION=""
fi

# Nextcloud version via occ
NC_VERSION=""
if [ -d "${NC_PATH}" ]; then
  if sudo -n -u www-data php "${NC_PATH}/occ" status >/dev/null 2>&1; then
    NC_VERSION=$(sudo -n -u www-data php "${NC_PATH}/occ" status | awk '/version:/{print $3}' || true)
  elif php "${NC_PATH}/occ" status >/dev/null 2>&1; then
    NC_VERSION=$(php "${NC_PATH}/occ" status | awk '/version:/{print $3}' || true)
  fi
fi

# Uptime in whole days
UPTIME_DAYS=$(awk '{print int($1/86400)}' /proc/uptime 2>/dev/null || echo "")

# Build payload
payload=$(cat <<JSON
{
  "key": "${KEY}",
  "versions": [
    { "variable": "PHP_Version",   "version": "${PHP_VERSION}" },
    { "variable": "NC_Version",    "version": "${NC_VERSION}" },
    { "variable": "Mysql_Version", "version": "${MYSQL_VERSION}" },
    { "variable": "Uptime_Days",   "version": "${UPTIME_DAYS}" }
  ]
}
JSON
)

# Send
curl -fsS -X POST "${DOMAIN}/api/ingest" -H "Content-Type: application/json" -d "${payload}" || echo "ingest failed"

# Non-fatal warnings
[ -n "${PHP_VERSION}" ]   || echo "WARN: PHP not found."
[ -n "${MYSQL_VERSION}" ] || echo "WARN: mysql/mariadb not found."
[ -n "${NC_VERSION}" ]    || echo "WARN: Nextcloud version not detected (check NC_PATH and permissions)."
[ -n "${UPTIME_DAYS}" ]   || echo "WARN: Could not read /proc/uptime."
