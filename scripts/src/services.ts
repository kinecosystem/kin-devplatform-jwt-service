import * as moment from "moment";
import { readFileSync } from "fs";
import * as jsonwebtoken from "jsonwebtoken";
import { Request, Response, RequestHandler } from "express";

import { randomItem, path } from "./utils";
import { getConfig } from "./config";

class KeyMap extends Map<string, { algorithm: string; key: Buffer; }> {
	public random() {
		const entries = Array.from(this.entries()).map(([id, key]) => ({
			id,
			key: key.key,
			algorithm: key.algorithm
		}));

		return randomItem(entries);
	}
}

const CONFIG = getConfig();
const PRIVATE_KEYS = new KeyMap();
const PUBLIC_KEYS = new Map<string, string>();

export type RegisterRequest = Request & {
	query: {
		user_id: string;
	}
};

export const getRegisterJWT = function(req: RegisterRequest, res: Response) {
	if (req.query.user_id) {
		res.status(200).json({ jwt: sign("register", { user_id: req.query.user_id }) });
	} else {
		res.status(400).send({ error: "'user_id' query param is missing" });
	}
} as any as RequestHandler;

export type SpendRequest = Request & {
	query: {
		offer_id: string;
	}
};

export const getSpendJWT = function(req: SpendRequest, res: Response) {
	if (req.query.offer_id) {
		let offer;
		CONFIG.offers.forEach(item => {
			if (item.id === req.query.offer_id) {
				offer = item;
			}
		});

		if (offer) {
			res.status(200).json({ jwt: sign("spend", { offer } ) });
		} else {
			res.status(400).send({ error: `cannot find offer with id '${ req.query.offer_id }'` });
		}
	} else {
		res.status(400).send({ error: "'offer_id' query param is missing" });
	}
} as any as RequestHandler;

export const getOffers = function(req: Request, res: Response) {
	res.status(200).send({ offers: CONFIG.offers });
} as any as RequestHandler;

export type ArbitraryPayloadRequest = Request & {
	body: {
		subject: string;
		payload: { [key: string]: any };
	}
};

export const signArbitraryPayload = function(req: ArbitraryPayloadRequest, res: Response) {
	if (req.body.subject && req.body.payload) {
		res.status(200).json({ jwt: sign(req.body.subject, req.body.payload) });
	} else {
		res.status(400).send({ error: `missing 'subject' and/or 'payload' in request body` });
	}
} as any as RequestHandler;

export type ValidateRequest = Request & {
	query: {
		jwt: string;
	}
};

export type JWTContent = {
	header: {
		typ: string;
		alg: string;
		kid: string;
	};
	payload: any;
	signature: string;
};

export const validateJWT = function(req: ValidateRequest, res: Response) {
	const decoded = jsonwebtoken.decode(req.query.jwt, { complete: true }) as JWTContent;
	const publicKey = PUBLIC_KEYS.get(decoded.header.kid);
	try {
		if (!publicKey) {
			throw new Error(`no key for kid ${decoded.header.kid}`);
		}
		jsonwebtoken.verify(req.query.jwt, publicKey); // throws
		res.status(200).json({ is_valid: true });
	} catch (e) {
		res.status(200).json({ is_valid: false, error: e });
	}
} as any as RequestHandler;

function sign(subject: string, payload: any) {
	const signWith = PRIVATE_KEYS.random();

	payload = Object.assign({
		iss: getConfig().app_id,
		exp: moment().add(6, "hours").valueOf(),
		iat: moment().valueOf(),
		sub: subject
	}, payload);

	return jsonwebtoken.sign(payload, signWith.key, {
		header: {
			kid: signWith.id,
			alg: signWith.algorithm,
			typ: "JWT"
		}
	});
}

// init
(() => {
	Object.entries(CONFIG.private_keys).forEach(([ name, key ]) => {
		PRIVATE_KEYS.set(name, { algorithm: key.algorithm, key: readFileSync(path(key.file)) });
	});
	Object.entries(CONFIG.public_keys).forEach(([ name, key ]) => {
		PUBLIC_KEYS.set(name, readFileSync(path(key), "utf-8"));
	});
})();
