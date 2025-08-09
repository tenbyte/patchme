#!/bin/bash

set -e

CYAN="\033[36m"
WHITE="\033[0m"
BOLD="\033[1m"
RESET="\033[0m"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' 

IMAGE_NAME="patchme"
REGISTRY="ghcr.io/tenbyte"
VERSION=${1:-latest}
PLATFORMS="linux/amd64,linux/arm64"

echo -e "${CYAN}  __ ${RESET}${WHITE}    _             _           _       "
echo -e "${CYAN}  \ \ ${RESET}${WHITE}  | |_ ___ _ __ | |__  _   _| |_ ___ "
echo -e "${CYAN}   \ \ ${RESET}${WHITE} | __/ _ \ '_ \| '_ \| | | | __/ _ \\"
echo -e "${CYAN}   / / ${RESET}${WHITE} | ||  __/ | | | |_) | |_| | ||  __/"
echo -e "${CYAN}  /_/ ${RESET}${WHITE}   \__\___|_| |_|_.__/ \\__, |\\__\\___|"
echo -e "                            |___/         ${RESET}"
echo -e ""
echo -e "${BOLD}${CYAN}       PATCHME - POWERED BY TENBYTE ${RESET}\n"

echo -e "${GREEN}🚀 Building PatchMe Docker Image${NC}"
echo -e "${YELLOW}Version: ${VERSION}${NC}"
echo -e "${YELLOW}Platforms: ${PLATFORMS}${NC}"

if ! docker buildx version > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker buildx is required for multi-platform builds${NC}"
    exit 1
fi

if ! docker buildx inspect patchme-builder > /dev/null 2>&1; then
    echo -e "${YELLOW}📦 Creating buildx builder...${NC}"
    docker buildx create --name patchme-builder --use
fi

echo -e "${YELLOW}📦 Building multi-platform image...${NC}"

docker buildx build \
    --platform "${PLATFORMS}" \
    --tag "${REGISTRY}/${IMAGE_NAME}:${VERSION}" \
    --tag "${REGISTRY}/${IMAGE_NAME}:latest" \
    --push \
    --cache-from type=gha \
    --cache-to type=gha,mode=max \
    .

echo -e "${GREEN}✅ Multi-platform build completed!${NC}"
echo -e "${GREEN}📦 Images available:${NC}"
echo -e "   ${REGISTRY}/${IMAGE_NAME}:${VERSION}"
echo -e "   ${REGISTRY}/${IMAGE_NAME}:latest"

echo -e "${YELLOW}🧪 Testing image locally...${NC}"
docker run --rm \
    -e DATABASE_URL="mysql://test:test@localhost:3306/test" \
    -e JWT_SECRET="test-secret" \
    --entrypoint="" \
    "${REGISTRY}/${IMAGE_NAME}:${VERSION}" \
    node --version

echo -e "${GREEN}✅ Image test successful!${NC}"
echo -e "${GREEN}🎉 Build and deployment completed!${NC}"