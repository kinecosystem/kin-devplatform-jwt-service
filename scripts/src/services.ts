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
const KEYS = new KeyMap();

export type RegisterRequest = Request & {
	query: {
		userId: string;
	}
};
export const getRegisterJWT = function(req: RegisterRequest, res: Response) {
	if (req.query.userId) {
		res.status(200).json({ token: sign("register", { user_id: req.query.userId }) });
	} else {
		res.status(400).send({ error: "'userId' query param is missing" });
	}
} as any as RequestHandler;

export type SpendRequest = Request & {
	query: {
		offerId: string;
	}
};
export const getSpendJWT = function(req: SpendRequest, res: Response) {
	if (req.query.offerId) {
		let offer;
		CONFIG.offers.forEach(item => {
			if (item.id === req.query.offerId) {
				offer = item;
			}
		});

		if (offer) {
			res.status(200).json({ token: sign("spend", randomItem(CONFIG.offers)) });
		} else {
			res.status(400).send({ error: `cannot find offer with id '${ req.query.offerId }'` });
		}
	} else {
		res.status(400).send({ error: "'offerId' query param is missing" });
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
		res.status(200).json({ token: sign(req.body.subject, req.body.payload) });
	} else {
		res.status(400).send({ error: `missing 'subject' and/or 'payload' in request body` });
	}
} as any as RequestHandler;

function sign(subject: string, payload: any) {
	const signWith = KEYS.random();

	payload = Object.assign({
		typ: "JWT"
	}, payload);

	return jsonwebtoken.sign(payload, signWith.key, {
		subject,
		keyid: signWith.id,
		algorithm: signWith.algorithm,
		expiresIn: moment().add(6, "hours").valueOf()
	});
}

// init
(() => {
	Object.entries(CONFIG.private_keys).forEach(([ name, key ]) => {
		KEYS.set(name, { algorithm: key.algorithm, key: readFileSync(path(key.file)) });
	});
})();
