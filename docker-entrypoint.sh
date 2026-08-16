#!/bin/sh
set -e

npx prisma migrate deploy

if [ "$SEED_ON_START" = "true" ]; then
  npm run db:seed
fi

exec npm run start
