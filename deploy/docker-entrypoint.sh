#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  node node_modules/prisma/build/index.js migrate deploy
fi

echo "Starting VynTech Solutions..."
exec node server.js
