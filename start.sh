#!/bin/sh

CYAN="\033[36m"
WHITE="\033[0m"
BOLD="\033[1m"
RESET="\033[0m"

echo -e "${CYAN}  __ ${RESET}${WHITE}    _             _           _       "
echo -e "${CYAN}  \ \ ${RESET}${WHITE}  | |_ ___ _ __ | |__  _   _| |_ ___ "
echo -e "${CYAN}   \ \ ${RESET}${WHITE} | __/ _ \ '_ \| '_ \| | | | __/ _ \\"
echo -e "${CYAN}   / / ${RESET}${WHITE} | ||  __/ | | | |_) | |_| | ||  __/"
echo -e "${CYAN}  /_/ ${RESET}${WHITE}   \__\___|_| |_|_.__/ \\__, |\\__\\___|"
echo -e "                            |___/         ${RESET}"
echo -e ""
echo -e "${BOLD}${CYAN}       PATCHME - POWERED BY TENBYTE ${RESET}\n"

echo "Waiting for database connection..."

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database..."
echo "start seeding with tsx..."
if npx tsx prisma/seed.ts; then
    echo "✅ Database seeding completed successfully"
else
    echo "❌ Database seeding failed - checking for errors..."
    export DEBUG="prisma:*"
    export PRISMA_ENGINE_PROTOCOL="json"
    if npx tsx prisma/seed.ts; then
        echo "✅ Database seeding with DEBUG flags successful"
    else
        echo "❌ Seeding failed - continuing ohne demo data"
    fi
fi

echo "Starting application..."
export HOSTNAME=0.0.0.0
export PORT=${PORT:-3000}
exec node server.js