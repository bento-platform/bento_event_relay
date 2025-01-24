import pj from "../package.json" with {type: "json"};

const parseIntIfInt = v => v && v.toString().match(/^\d+$/) ? parseInt(v, 10) : v;

const BENTO_SERVICE_KIND = "event-relay"
const SERVICE_TYPE = {
    "group": "ca.c3g.bento",
    "artifact": BENTO_SERVICE_KIND,
    "version": pj.version,
};
const SERVICE_ID = process.env.SERVICE_ID || Object.values(SERVICE_TYPE).slice(0, 2).join(":");
export const SERVICE_NAME = "Bento Event Relay";

export const SERVICE_INFO = {
    "id": SERVICE_ID,
    "name": SERVICE_NAME,
    "type": SERVICE_TYPE,
    "description": "Event relay from Redis PubSub events to socket.io.",
    "organization": {
        "name": "C3G",
        "url": "https://www.computationalgenomics.ca/",
    },
    "contactUrl": "mailto:info@c3g.ca",
    "version": pj.version,
    "environment": process.env.NODE_ENV === "development" ? "dev" : "prod",
    "bento": {
        "serviceKind": BENTO_SERVICE_KIND,
        "gitRepository": "https://github.com/bento-platform/bento_event_relay",
    },
};

export const BENTO_DEBUG = ["true", "1", "yes"].includes((process.env.BENTO_DEBUG || "").toLocaleLowerCase());

export const JSON_MESSAGES = (process.env.JSON_MESSAGES || "true").trim().toLocaleLowerCase() === "true";
export const REDIS_CONNECTION = process.env.REDIS_CONNECTION || "redis://localhost:6379";
export const REDIS_SUBSCRIBE_PATTERN = process.env.REDIS_SUBSCRIBE_PATTERN || "bento.*";
export const SERVICE_URL_BASE_PATH = process.env.SERVICE_URL_BASE_PATH || "";

export const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(";") : undefined;
export const SOCKET_IO_PATH = process.env.SOCKET_IO_PATH || "/socket.io/";

// Listen on a port or socket file if specified; default to 8080 if not
// Also check SERVICE_SOCKET, where chord_singularity passes pre-set socket paths to services
export const SERVICE_LISTEN_ON = parseIntIfInt(process.env.SERVICE_LISTEN_ON || process.env.SERVICE_SOCKET || 8080);

// For authentication/authorization
export const BENTO_AUTHZ_SERVICE_URL = process.env.BENTO_AUTHZ_SERVICE_URL;
