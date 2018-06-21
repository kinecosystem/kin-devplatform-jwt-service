import { path } from "./utils";
import { LogTarget } from "./logging";

export type Config = {
	port: number;
	host: string;
	app_id: string;
	loggers?: LogTarget[];
	private_keys: {
		[name: string]: {
			algorithm: string;
			file: string;
		}
	};
	public_keys: {
		[name: string]: string;
	};
	offers: Array<{
		id: string;
		title: string;
		amount: number;
		description: string;
		wallet_address: string;
		type: "earn" | "spend";
	}>;
	marketplace_service: string | null;
};

let config: Config;

export function init(filePath: string): Config {
	config = require(path(filePath!));
	config.app_id = process.env.APP_NAME || config.app_id;
	config.port = parseInt(process.env.APP_PORT || "", 10) || config.port;
	config.host = process.env.APP_HOST || config.host;
	config.marketplace_service = process.env.APP_MARKETPLACE_SERVICE || config.marketplace_service;

	// override values with env vars
	return config;
}

export function getConfig(): Config {
	return config;
}
