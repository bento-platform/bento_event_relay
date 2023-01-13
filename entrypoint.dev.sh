#!/bin/sh

if [ -z "${INTERNAL_PORT}" ]; then
  # Set default internal port to 8080
  export INTERNAL_PORT=8080
fi

npm ci
npx nodemon -L
