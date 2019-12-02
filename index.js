#!/usr/bin/env node

const http = require("http");
const redis = require("redis");
const socketIO = require("socket.io");

const app = http.createServer((_, res) => {
    res.writeHead(404);
    res.end();
});

const client = redis.createClient(process.env.REDIS_SOCKET || {});
const io = socketIO(app);

io.on("connection", socket => {
    // TODO: Multiple clients??
    client.on("pmessage", (_, message) => {
        // TODO: Filter message type in relay
        // TODO: Catch parse exceptions
        try {
            const messageData = JSON.parse(message);
            socket.emit("events", messageData);
        } catch (e) {
            console.error(`Encountered error while relaying message: ${e}`);
        }
    });
});

app.listen(process.env.SERVICE_SOCKET || 8080);
