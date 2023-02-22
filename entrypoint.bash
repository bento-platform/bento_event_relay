#!/bin/bash

cd /app || exit

# Create bento_user + home
source /create_service_user.bash

# Fix permissions on /app and /app/node-modules
chown -R bento_user:bento_user /app

# Fix permissions on the data directory
if [[ -n "${SERVICE_DATA}" ]]; then
  chown -R bento_user:bento_user "${SERVICE_DATA}"
fi

# Drop into bento_user from root and execute the CMD specified for the image
exec gosu bento_user "$@"
