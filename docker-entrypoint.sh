#!/bin/sh
set -e

echo "Applying Prisma schema..."
npx prisma db push --accept-data-loss

echo "Starting Next.js dev server..."
exec npm run dev
