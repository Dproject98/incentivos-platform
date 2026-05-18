#!/bin/sh
# Ejecuta Prisma db push (aplica schema sin migraciones) y luego arranca Next.js
# Se ejecuta automáticamente al iniciar el contenedor via CMD en el Dockerfile

set -e

echo "🔄 Aplicando schema de base de datos..."
npx prisma db push --skip-generate --accept-data-loss

echo "✅ Base de datos lista. Arrancando Next.js..."
exec node server.js
