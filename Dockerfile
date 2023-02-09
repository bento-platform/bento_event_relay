FROM ghcr.io/bento-platform/bento_base_image:node-debian-2023.02.09

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci --production

COPY . .

ENTRYPOINT [ "bash", "./entrypoint.bash" ]
