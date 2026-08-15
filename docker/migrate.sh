#!/bin/sh
# Aplica el schema de Prisma y arranca Next.js.
# Ejecutado automáticamente al iniciar el contenedor.

set -e

echo "[migrate] Verificando variables de entorno requeridas..."
: "${DATABASE_URL:?ERROR: DATABASE_URL no está definida}"
: "${NEXTAUTH_SECRET:?ERROR: NEXTAUTH_SECRET no está definida}"
: "${NEXTAUTH_URL:?ERROR: NEXTAUTH_URL no está definida}"

echo "[migrate] Aplicando schema de base de datos..."
# --skip-generate: el cliente ya fue generado en el build (no regenerar en producción)
# SIN --accept-data-loss: falla si hay cambios destructivos — esto es intencional en producción
npx prisma migrate deploy 2>/dev/null || {
  echo "[migrate] prisma migrate deploy falló, intentando db push (solo para primeras instalaciones)..."
  npx prisma db push --skip-generate
}

echo "[migrate] Base de datos lista. Arrancando Next.js..."
exec node server.js
