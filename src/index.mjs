#!/usr/bin/env node

// Small service to forward events from Redis PubSub to socket.io connections
// (e.g. a JavaScript front-end.)
// Author: David Lougheed <david.lougheed@mail.mcgill.ca>
// Copyright: Canadian Centre for Computational Genomics, 2019-2023

import http from "http";
import redis from "redis";
import socketIO from "socket.io";

import {
    SERVICE_URL_BASE_PATH,
    SERVICE_INFO,
    SOCKET_IO_PATH,
    SERVICE_NAME,
    REDIS_CONNECTION,
    REDIS_SUBSCRIBE_PATTERN,
    SERVICE_LISTEN_ON,
    JSON_MESSAGES,
} from "./config.mjs";
import {checkAgainstAuthorizationService} from "./auth.mjs";

const SOCKET_IO_FULL_PATH = `${SERVICE_URL_BASE_PATH}${SOCKET_IO_PATH}`;

const app = http.createServer((req, res) => {
    // Only respond to /service-info requests and socket.io stuff in HTTP handler

    if (req.url.startsWith(`${SERVICE_URL_BASE_PATH}/service-info`)) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(SERVICE_INFO));
    } else if (!req.url.startsWith(SOCKET_IO_FULL_PATH)) {
        // Not /service-info or /socket.io/ [or similar], so return a 404.
        console.error(`[${SERVICE_NAME}] 404: ${req.url}`);
        res.writeHead(404);
        res.end();
    }
});

const io = new socketIO.Server(app, {
    path: SOCKET_IO_FULL_PATH,
    serveClient: false,
});

// Create a pub-sub client to listen for events
const client = redis.createClient({
    url: REDIS_CONNECTION,
});

(async () => {
    await client.connect();

    // Set up socket.io auth middleware
    io.use((socket, next) => {
        const {token} = socket.handshake.auth;

        ((async () => {
            const res = await checkAgainstAuthorizationService(token);
            if (res) {
                next();
            } else {
                next(new Error("forbidden"));
            }
        })());
    });
    // TODO: system for token refresh + continued authentication with socket.io

    // Subscribe to all incoming messages
    // Forward any message received to all currently-open socket.io connections
    await client.pSubscribe(REDIS_SUBSCRIBE_PATTERN, (message, channel) => {
        (async () => {
            // TODO: Filter message type in relay - security / traffic reduction
            for (const socket of (await io.fetchSockets())) {
                try {
                    // Include channel in message data, since otherwise the information is lost on the receiving end.
                    // If we're in "generic mode" (i.e. JSON_MESSAGES is false) then the message is passed as the single
                    // key in an event object; otherwise, pass the deserialized data.
                    socket.emit("events", {message: JSON_MESSAGES ? JSON.parse(message) : message, channel});
                } catch (e) {
                    console.error(
                        `Encountered error while relaying message: ${e} 
                        (pattern: ${REDIS_SUBSCRIBE_PATTERN}, channel: ${channel}, message: ${message})`
                    );
                }
            }
        })();
    });

    // Listen on a socket file or port
    app.listen(SERVICE_LISTEN_ON);
    console.log(`bento_event_relay listening on ${SERVICE_LISTEN_ON}`);
    console.log("config:");
    console.log(`\tJSON_MESSAGES=${JSON_MESSAGES}`);
    console.log(`\tREDIS_CONNECTION=${REDIS_CONNECTION}`);
    console.log(`\tREDIS_SUBSCRIBE_PATTERN=${REDIS_SUBSCRIBE_PATTERN}`);
    console.log(`\tSERVICE_URL_BASE_PATH=${SERVICE_URL_BASE_PATH}`);
    console.log(`\tSOCKET_IO_PATH=${SOCKET_IO_PATH}`);
    console.log(`\tSERVICE_LISTEN_ON=${SERVICE_LISTEN_ON}`);
})();

// Properly shut down (thus cleaning up any open socket files) when a signal is received
const shutdown = () => {
    (async () => {
        await client.disconnect();
        app.close(() => process.exit());
    })();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
