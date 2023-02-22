FROM ghcr.io/bento-platform/bento_base_image:node-debian-2023.02.21

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY entrypoint.bash .
COPY run.dev.bash .

RUN npm ci

ENTRYPOINT [ "bash", "./entrypoint.bash" ]
CMD ["bash", "./run.dev.bash"]
