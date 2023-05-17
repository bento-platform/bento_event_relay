#!/bin/bash

# Set default internal port to 8080
: "${INTERNAL_PORT:=8080}"

# Start the server
npm run start
