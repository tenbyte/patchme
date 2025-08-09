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

echo "Generating Prisma Client..."
npx prisma generate

echo "Seeding database..."
npx prisma db seed

echo "Starting application..."
exec node server.js