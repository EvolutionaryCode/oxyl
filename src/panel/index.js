const babelify = require("express-babelify-middleware");
const config = require("../../config");
const cookieParser = require("cookie-parser");
const express = require("express");
const fs = require("fs");
const oauth = require("../oauth/index");

const app = express();
app.locals.url = config.panelURL;
app.locals.redirectURI = `https://discordapp.com/oauth2/authorize?response_type=code&redirect_uri=` +
	`${`${encodeURIComponent(config.panelURL)}/callback`}&scope=identify&client_id=${config.clientID}`;

app.set("views", "./views");
app.set("view engine", "ejs");
require("http").createServer(app).listen(config.panelPort);

app.use(`/js`, babelify(`./public/js`, babelify.browserifySettings, { presets: ["env"] }));
app.use(express.static("./public"));
app.use(cookieParser());

app.use(async (req, res, next) => {
	if(req.path === "/callback") return next();

	if(!req.cookies.token) return res.redirect(req.app.locals.redirectURI);
	let token;
	try {
		token = JSON.parse(token);
	} catch(err) {
		return res.redirect(req.app.locals.redirectURI);
	}

	try {
		let info = oauth.info(token, "users/@me");
		if(info.token) {
			res.set("Set-Cookie", `token=${JSON.stringify(info.token).replace(/"/g, `\\"`)}; Max-Age=31,540,000`);
			info = info.data;
		}

		if(!~config.owners.indexOf(info.id)) return res.status(403).send("Forbidden");
	} catch(err) {
		return res.redirect(req.app.locals.redirectURI);
	}

	return next();
});

const routes = fs.readdirSync("./routes");
routes.forEach(script => {
	const name = script.slice(0, -2);
	if(name === "index") app.use("/", require(`./routes/${script}`));
	else app.use(`/${name}`, require(`./routes/${script}`));
});
