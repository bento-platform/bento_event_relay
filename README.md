# Bento Event Relay

Relays Redis PubSub events to front-ends via Socket.IO. Originally designed for
the Bento platform, but can be used in a more generic context if needed.

## Configuration

All configuration is done via environment variables:

```bash
# If true, JSON_MESSAGES will parse all messages recieved from the subscription
# and de-serialize them before passing them to the socket.io connection.
# e.g. If the message {"test": true} is passed with JSON_MESSAGES on, the
# corresponding socket.io message will be:
# {"message": {"test": true}, "channel": "chord.something"}
# Otherwise, the message will be:
# {"message": "{\"test\": true}", "channel": "chord.something"}
JSON_MESSAGES="true" 

# Default: blank, base path for the service-info endpoint
# If blank, the service-info endpoint will be mounted on /service-info
# If e.g. /base, the endpoint will be mounted on /base/service-info
SERVICE_URL_BASE_PATH=

# socket.io "path" for the server created by the service.
SOCKET_IO_PATH="/socket.io"

# Connection string (URL or path to UNIX socket file) for the Redis instance.
REDIS_CONNECTION=

# Subscription pattern the Redis PubSub connection. The default is configured
# to be chord.* for the Bento platform, but it can be set to anything.
# See https://redis.io/topics/pubsub and specifically the pattern-matching.
REDIS_SUBSCRIBE_PATTERN="chord.*"
```

## HTTP Endpoints

The `bento_event_relay` service only has one HTTP endpoint, `/service-info`,
which follows the 
[GA4GH service-info](https://github.com/ga4gh-discovery/ga4gh-service-info) 
schema standard.
