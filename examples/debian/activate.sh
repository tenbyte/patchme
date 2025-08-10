#!/bin/bash

# PatchMe Debian/Ubuntu Activation Script
# Downloads and installs systemd timer and service files

set -euo pipefail

REPO_URL="https://raw.githubusercontent.com/tenbyte/patchme/main/examples/debian"
SERVICE_FILE="pm_ingest.service"
TIMER_FILE="pm_ingest.timer"
SYSTEMD_DIR="/etc/systemd/system"

CYAN='\033[36m'
WHITE='\033[0m'
BOLD='\033[1m'
RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo
echo -e "${CYAN}  __ ${RESET}${WHITE}    _             _           _       "
echo -e "${CYAN}  \ \ ${RESET}${WHITE}  | |_ ___ _ __ | |__  _   _| |_ ___ "
echo -e "${CYAN}   \ \ ${RESET}${WHITE} | __/ _ \ '_ \| '_ \| | | | __/ _ \\"
echo -e "${CYAN}   / / ${RESET}${WHITE} | ||  __/ | | | |_) | |_| | ||  __/"
echo -e "${CYAN}  /_/ ${RESET}${WHITE}   \__\___|_| |_|_.__/ \\__, |\\__\\___|"
echo -e "                            |___/         ${RESET}"
echo -e ""
echo -e "${BOLD}${CYAN}       PATCHME - POWERED BY TENBYTE ${RESET}\n"
echo

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root (use sudo)${NC}"
    exit 1
fi

# Check if systemctl is available
if ! command -v systemctl &> /dev/null; then
    echo -e "${RED}Error: systemctl not found. This script requires systemd.${NC}"
    exit 1
fi

# Download service file
echo -e "${YELLOW}Downloading ${SERVICE_FILE}...${NC}"
if curl -fsSL "${REPO_URL}/${SERVICE_FILE}" -o "${SYSTEMD_DIR}/${SERVICE_FILE}"; then
    echo -e "${GREEN}✓ ${SERVICE_FILE} downloaded successfully${NC}"
else
    echo -e "${RED}✗ Failed to download ${SERVICE_FILE}${NC}"
    exit 1
fi

# Download timer file
echo -e "${YELLOW}Downloading ${TIMER_FILE}...${NC}"
if curl -fsSL "${REPO_URL}/${TIMER_FILE}" -o "${SYSTEMD_DIR}/${TIMER_FILE}"; then
    echo -e "${GREEN}✓ ${TIMER_FILE} downloaded successfully${NC}"
else
    echo -e "${RED}✗ Failed to download ${TIMER_FILE}${NC}"
    exit 1
fi

# Set correct permissions
chmod 644 "${SYSTEMD_DIR}/${SERVICE_FILE}"
chmod 644 "${SYSTEMD_DIR}/${TIMER_FILE}"

# Reload systemd daemon
echo -e "${YELLOW}Reloading systemd daemon...${NC}"
systemctl daemon-reload

# Enable and start timer
echo -e "${YELLOW}Enabling and starting ${TIMER_FILE}...${NC}"
systemctl enable "${TIMER_FILE}"
systemctl start "${TIMER_FILE}"

echo
echo -e "${GREEN}✓ PatchMe systemd files installed successfully!${NC}"
echo
echo "Next steps:"
echo "1. Create the ingest script: /usr/local/bin/pm_ingest.sh"
echo "2. Make it executable: chmod +x /usr/local/bin/pm_ingest.sh"
echo "3. Configure DOMAIN and KEY variables in the script"
echo
echo "Check timer status with:"
echo "  systemctl status pm_ingest.timer"
echo "  systemctl list-timers pm_ingest.timer"
echo
echo "Check service logs with:"
echo "  journalctl -u pm_ingest.service"
echo
echo "Systemd unit files installed to: ${SYSTEMD_DIR}"