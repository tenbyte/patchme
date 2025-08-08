#!/bin/sh

pnpm install

npx prisma generate

npx prisma migrate deploy

npx prisma db seed

pnpm add -D typescript ts-node
pnpm add -D @types/node
pnpm add @prisma/client prisma --save-dev

pnpm build

node_modules/.bin/next start
