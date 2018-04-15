import * as _path from "path";

const fromProjectRoot = _path.join.bind(path, __dirname, "../../");

export function path(...paths: string[]): string {
	return fromProjectRoot(...paths);
}

export type ServerError = Error & { syscall: string; code: string; };

export function random(): number;
export function random(min: number, max: number): number;
export function random(min?: number, max?: number): number {
	if (min !== undefined && max !== undefined) {
		return Math.random() * (max - min) + min;
	}

	return Math.random();
}

export function randomInteger(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

export function randomItem<T = any>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

const ID_LENGTH = 20;
const ID_CHARS = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export function generateId(): string {
	let id = "";

	while (id.length < ID_LENGTH) {
		id += ID_CHARS[randomInteger(0, ID_CHARS.length)];
	}

	return id;
}

export function normalizeError(error: string | Error | any): string {
	if (typeof error === "string") {
		return error;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return error.toString();
}
