import * as http from "http";

import { init as initConfig } from "./config";
const config = initConfig("config/default.json");

import { initLogger } from "./logging";
const logger = initLogger(...config.loggers!);

import { ServerError } from "./utils";
import { app } from "./app";

const server = http.createServer(app);
server.listen(config.port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: ServerError) {
	if (error.syscall !== "listen") {
		throw error;
	}

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case "EACCES":
			logger.error(`${ config.port } requires elevated privileges`);
			process.exit(1);
			break;
		case "EADDRINUSE":
			logger.error(`${ config.port } is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
	const addr = server.address();
	logger.debug(`Listening on ${ addr.port }`);
}
