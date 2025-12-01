#!/usr/bin/env node

// Small service to forward events from Redis PubSub to socket.io connections
// (e.g. a JavaScript front-end.)
// Author: David Lougheed <david.lougheed@mail.mcgill.ca>
// Copyright: Canadian Centre for Computational Genomics, 2019-2025

import http from "http";
import redis from "redis";
import * as socketIO from "socket.io";

import {
    SERVICE_URL_BASE_PATH,
    SERVICE_INFO,
    SOCKET_IO_PATH,
    CORS_ORIGINS,
    SERVICE_NAME,
    REDIS_CONNECTION,
    REDIS_SUBSCRIBE_PATTERN,
    SERVICE_LISTEN_ON,
    JSON_MESSAGES,
} from "./config.mjs";
import {checkAgainstAuthorizationService} from "./auth.mjs";
import logger from "./logger.mjs";

const SOCKET_IO_FULL_PATH = `${SERVICE_URL_BASE_PATH}${SOCKET_IO_PATH}`;

const app = http.createServer((req, res) => {
    // Only respond to /service-info requests and socket.io stuff in HTTP handler

    if (req.url.startsWith(`${SERVICE_URL_BASE_PATH}/service-info`)) {
        const currentOrigin = CORS_ORIGINS.find(origin => origin === req.headers.origin);
        res.writeHead(200, {
            ...(currentOrigin ? {
                "Access-Control-Allow-Origin": currentOrigin,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Headers": "authorization",
            } : {}),
            "Content-Type": "application/json",
        });
        res.end(JSON.stringify(SERVICE_INFO));
    } else if (!req.url.startsWith(SOCKET_IO_FULL_PATH)) {
        // Not /service-info or /socket.io/ [or similar], so return a 404.
        console.error(`[${SERVICE_NAME}] 404: ${req.url}`);
        res.writeHead(404);
        res.end();
    }
});

const io = new socketIO.Server(app, {
    cors: {
        origin: CORS_ORIGINS,
    },
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

    const subLogger = logger.child({
        pattern: REDIS_SUBSCRIBE_PATTERN,
    })

    // Subscribe to all incoming messages
    // Forward any message received to all currently-open socket.io connections
    await client.pSubscribe(REDIS_SUBSCRIBE_PATTERN, (message, channel) => {
        (async () => {
            const msgLogger = subLogger.child({ channel, message });
            msgLogger.debug("received message");
            // TODO: Filter message type in relay - security / traffic reduction
            for (const socket of (await io.fetchSockets())) {
                try {
                    // Include channel in message data, since otherwise the information is lost on the receiving end.
                    // If we're in "generic mode" (i.e. JSON_MESSAGES is false) then the message is passed as the single
                    // key in an event object; otherwise, pass the deserialized data.
                    socket.emit("events", {message: JSON_MESSAGES ? JSON.parse(message) : message, channel});
                } catch (e) {
                    msgLogger.child({ error: e }).error("encountered error while relaying message");
                }
            }
        })();
    });

    // Listen on a socket file or port
    app.listen(SERVICE_LISTEN_ON);
    logger.child({
        port: SERVICE_LISTEN_ON,
        config: {
            JSON_MESSAGES,
            REDIS_CONNECTION,
            REDIS_SUBSCRIBE_PATTERN,
            SERVICE_URL_BASE_PATH,
            SOCKET_IO_PATH,
            SERVICE_LISTEN_ON,
        },
    }).info("bento_event_relay listening");
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
