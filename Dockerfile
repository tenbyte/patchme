FROM node:24-alpine

WORKDIR /app

RUN apk update && \
    rm -rf /tmp/* /var/tmp/*

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY --chown=node:node . .

EXPOSE 3000

RUN chmod +x docker-start.sh
CMD ["./docker-start.sh"]