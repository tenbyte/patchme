#!/bin/sh

if echo "$DATABASE_URL" | grep -q 'mysql://'; then
  echo "Waiting for MySQL to be ready..."
  DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*mysql://[^@]+@([^:/]+):?([0-9]*).*|\1|')
  DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*mysql://[^@]+@[^:/]+:([0-9]+).*|\1|')
  if [ -z "$DB_PORT" ]; then DB_PORT=3306; fi
  until nc -z "$DB_HOST" "$DB_PORT"; do
    sleep 1
  done
  echo "MySQL is up!"
fi

pnpm install

npx prisma generate

npx prisma migrate deploy

npx prisma db seed

pnpm add -D typescript ts-node
pnpm add -D @types/node
pnpm add @prisma/client prisma --save-dev

pnpm build

node_modules/.bin/next start
