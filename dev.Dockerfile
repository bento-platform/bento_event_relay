FROM ghcr.io/bento-platform/bento_base_image:node-debian-2024.07.09

WORKDIR /app

COPY entrypoint.bash .
COPY run.dev.bash .
COPY package.json .
COPY package-lock.json .

RUN npm ci

ENTRYPOINT [ "bash", "./entrypoint.bash" ]
CMD ["bash", "./run.dev.bash"]
