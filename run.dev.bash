#!/bin/bash

# Set .gitconfig for development
/set_gitconfig.bash

# Set default internal port to 8080
: "${INTERNAL_PORT:=8080}"

# Install dependencies
npm ci

# Nodemon: run server and restart with any changes
npx nodemon -L
