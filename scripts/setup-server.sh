#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-server.sh — Configuración inicial del servidor casero (Ubuntu 22.04+)
#
# Ejecutar como root o con sudo:
#   chmod +x scripts/setup-server.sh
#   sudo ./scripts/setup-server.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

echo "════════════════════════════════════════════════"
echo "  incentivos-app — Configuración del servidor"
echo "════════════════════════════════════════════════"

# ── 1. Actualizar el sistema ──────────────────────────────────────────────────
echo ""
echo "[1/8] Actualizando el sistema..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Instalar dependencias ──────────────────────────────────────────────────
echo ""
echo "[2/8] Instalando dependencias..."
apt-get install -y -qq \
  curl wget git ufw fail2ban \
  nginx certbot python3-certbot-nginx \
  ca-certificates gnupg lsb-release \
  unattended-upgrades

# Docker
if ! command -v docker &>/dev/null; then
  echo "Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker "$SUDO_USER"
fi

# Docker Compose plugin
if ! docker compose version &>/dev/null; then
  echo "Instalando Docker Compose plugin..."
  apt-get install -y docker-compose-plugin
fi

# ── 3. Firewall UFW ───────────────────────────────────────────────────────────
echo ""
echo "[3/8] Configurando firewall UFW..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    comment "SSH"
ufw allow 80/tcp    comment "HTTP (redirect a HTTPS)"
ufw allow 443/tcp   comment "HTTPS"
# IMPORTANTE: El puerto 3000 (Next.js) NO se abre — solo accesible desde nginx en localhost
ufw --force enable
echo "UFW habilitado."

# ── 4. Fail2ban (protección brute-force SSH) ──────────────────────────────────
echo ""
echo "[4/8] Configurando Fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port    = ssh
logpath = %(sshd_log)s

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled  = true
filter   = nginx-limit-req
action   = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath  = /var/log/nginx/error.log
findtime = 600
bantime  = 7200
maxretry = 10
EOF
systemctl enable fail2ban
systemctl restart fail2ban
echo "Fail2ban configurado."

# ── 5. Actualizaciones de seguridad automáticas ───────────────────────────────
echo ""
echo "[5/8] Configurando actualizaciones automáticas de seguridad..."
cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

# ── 6. Hardening SSH ──────────────────────────────────────────────────────────
echo ""
echo "[6/8] Endureciendo configuración SSH..."
# Backup de la configuración original
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Aplica hardening mínimo sin romper el acceso
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/'       /etc/ssh/sshd_config
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/^#*X11Forwarding.*/X11Forwarding no/'           /etc/ssh/sshd_config
sed -i 's/^#*MaxAuthTries.*/MaxAuthTries 4/'              /etc/ssh/sshd_config
systemctl reload sshd
echo "SSH endurecido (root login deshabilitado)."

# ── 7. Crear directorio del proyecto y backups ────────────────────────────────
echo ""
echo "[7/8] Creando estructura de directorios..."
mkdir -p /opt/incentivos/backups
chmod 750 /opt/incentivos/backups

# ── 8. Resumen final ──────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo "  ✅ SERVIDOR CONFIGURADO"
echo "════════════════════════════════════════════════"
echo ""
echo "PRÓXIMOS PASOS:"
echo ""
echo "1. Copia el proyecto al servidor:"
echo "   scp -r . usuario@servidor:/opt/incentivos/app"
echo ""
echo "2. Crea el archivo .env.production:"
echo "   cp env.production.example /opt/incentivos/app/.env.production"
echo "   nano /opt/incentivos/app/.env.production"
echo ""
echo "3. Configura nginx con tu dominio:"
echo "   nano /etc/nginx/sites-available/incentivos"
echo "   (reemplaza 'tudominio.com' por tu dominio real)"
echo ""
echo "4. Obtén el certificado SSL:"
echo "   sudo certbot --nginx -d tudominio.com"
echo ""
echo "5. Arranca la aplicación:"
echo "   cd /opt/incentivos/app"
echo "   docker compose --env-file .env.production up -d"
echo ""
echo "6. Activa el backup automático (cron diario a las 3:00):"
echo "   echo '0 3 * * * /opt/incentivos/app/scripts/backup.sh >> /var/log/incentivos-backup.log 2>&1' | crontab -"
echo ""
echo "7. Comprueba que todo funciona:"
echo "   curl -f http://localhost:3000/api/health"
echo "   curl -f https://tudominio.com/api/health"
echo ""
