#!/bin/bash

# Set .gitconfig for development
/set_gitconfig.bash

if [ -z "${INTERNAL_PORT}" ]; then
  # Set default internal port to 8080
  export INTERNAL_PORT=8080
fi

# Install dependencies
npm ci

# Nodemon: run server and restart with any changes
npx nodemon -L
