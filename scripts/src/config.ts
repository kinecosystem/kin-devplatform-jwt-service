import { path } from "./utils";
import { LogTarget } from "./logging";

export type Config = {
	port: number;
	app_id: string;
	api_key: string;
	loggers?: LogTarget[];
	private_keys: {
		[name: string]: {
			algorithm: string;
			file: string;
		}
	};
	offers: Array<{
		id: string;
		title: string;
		amount: number;
		description: string;
		wallet_address: string;
	}>;
};

let config: Config;

export function init(filePath: string): Config {
	config = require(path(filePath!));
	return config;
}

export function getConfig(): Config {
	return config;
}
