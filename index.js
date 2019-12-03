#!/usr/bin/env node

const http = require("http");
const redis = require("redis");
const socketIO = require("socket.io");

const pj = require("./package");

const SERVICE_TYPE = `ca.c3g.chord:event-relay:${pj.version}`;
const SERVICE_ID = process.env.SERVICE_ID || SERVICE_TYPE;

const SERVICE_INFO = {
    "id": SERVICE_ID,
    "name": "CHORD Event Relay",
    "type": SERVICE_TYPE,
    "description": "Event relay for a CHORD application.",
    "organization": {
        "name": "C3G",
        "url": "http://c3g.ca"
    },
    "contactUrl": "mailto:david.lougheed@mail.mcgill.ca",
    "version": pj.version
};

const SERVICE_URL_BASE_PATH = process.env.SERVICE_URL_BASE_PATH || "";


const app = http.createServer((req, res) => {
    if (req.url === `${SERVICE_URL_BASE_PATH}/service-info`) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(SERVICE_INFO));
        return;
    }

    res.writeHead(404);
    res.end();
});

let socketID = 0;
const connections = {};

const io = socketIO(app, {path: SERVICE_URL_BASE_PATH + "/socket.io"});
io.on("connection", socket => {
    const newSocketID = socketID++;
    connections[newSocketID] = socket;
    socket.on("disconnect", () => delete connections[newSocketID]);
});

const client = redis.createClient(process.env.REDIS_SOCKET || {});
client.on("pmessage", (_, message) => {
    // TODO: Filter message type in relay
    // TODO: Catch parse exceptions
    Object.values(connections).forEach(socket => {
        try {
            const messageData = JSON.parse(message);
            socket.emit("events", messageData);
        } catch (e) {
            console.error(`Encountered error while relaying message: ${e}`);
        }
    });
});

app.listen(process.env.SERVICE_SOCKET || 8080);

const shutdown = () => app.close(() => process.exit());

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
