const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const oauth = require("./oauth");
const reddit = require("./reddit");

router.use("/oauth", oauth);
router.use("/reddit", reddit);

router.all("*", (req, res) => res.status(404).json({ error: "Method not found" }));
