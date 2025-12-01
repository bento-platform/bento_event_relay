import pino from "pino";

import { BENTO_DEBUG } from "./config.mjs";

const loggerConfig = BENTO_DEBUG ? { transport: { target: "pino-pretty" } } : {};

const logger = pino(loggerConfig);
export default logger;
