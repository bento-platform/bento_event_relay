FROM ghcr.io/bento-platform/bento_base_image:node-debian-2024.07.09

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci --production

COPY . .

ENTRYPOINT [ "bash", "./entrypoint.bash" ]
CMD [ "bash", "./run.bash" ]
