FROM node:18-bullseye-slim

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci

ENTRYPOINT ["sh", "./entrypoint.dev.sh"]