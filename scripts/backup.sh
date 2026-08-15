#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# backup.sh — Backup automático de PostgreSQL
#
# Uso manual:    ./scripts/backup.sh
# Cron diario:   0 3 * * * /ruta/al/proyecto/scripts/backup.sh >> /var/log/incentivos-backup.log 2>&1
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

BACKUP_DIR="/opt/incentivos/backups"
CONTAINER_NAME="incentivos-app-postgres-1"  # ajusta si docker-compose lo nombra diferente
DB_NAME="incentivos"
DB_USER="incentivos"
KEEP_DAYS=30  # conservar backups de los últimos 30 días

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/incentivos_${TIMESTAMP}.sql.gz"

echo "[$(date)] Iniciando backup..."

# Volcar la BD y comprimir en un solo paso
docker exec "$CONTAINER_NAME" \
  pg_dump -U "$DB_USER" -d "$DB_NAME" --no-password \
  | gzip > "$BACKUP_FILE"

echo "[$(date)] Backup guardado: $BACKUP_FILE ($(du -sh "$BACKUP_FILE" | cut -f1))"

# Eliminar backups más antiguos de $KEEP_DAYS días
find "$BACKUP_DIR" -name "incentivos_*.sql.gz" -mtime +${KEEP_DAYS} -delete
echo "[$(date)] Backups anteriores a $KEEP_DAYS días eliminados."

# Verificar que el backup no está vacío
if [ ! -s "$BACKUP_FILE" ]; then
  echo "[$(date)] ERROR: El archivo de backup está vacío." >&2
  exit 1
fi

echo "[$(date)] Backup completado correctamente."
