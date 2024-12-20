FROM ghcr.io/bento-platform/bento_base_image:node-debian-2024.11.01

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci --production

COPY . .

ENTRYPOINT [ "bash", "./entrypoint.bash" ]
CMD [ "bash", "./run.bash" ]
