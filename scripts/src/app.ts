import * as express from "express";

import { getConfig } from "./config";
import {
	getOffers,
	getEarnJWT,
	getSpendJWT,
	getPayToUserJWT,
	validateJWT,
	getRegisterJWT,
	signArbitraryPayload } from "./services";
import {
	statusHandler,
	notFoundHandler,
	generalErrorHandler,
	init as initCustomMiddleware, } from "./middleware";

const config = getConfig();

function createApp(): express.Express {
	const app = express();

	const bodyParser = require("body-parser");
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));

	initCustomMiddleware(app);

	return app;
}

export const app = createApp();

app.get("/offers", getOffers);
app.get("/earn/token", getEarnJWT);
app.get("/spend/token", getSpendJWT);
app.get("/paytouser/token", getPayToUserJWT);
app.get("/register/token", getRegisterJWT);
app.get("/validate", validateJWT);

app.post("/sign", signArbitraryPayload);
app.get("/status", statusHandler);

// catch 404
app.use(notFoundHandler);
// catch errors
app.use(generalErrorHandler);
