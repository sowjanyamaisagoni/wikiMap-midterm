// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const app        = express();
const morgan     = require('morgan');
const cookieSession = require('cookie-session');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['thewikiMapWebsite', 'thewikiMapWebsite2']
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
//const widgetsRoutes = require("./routes/widgets");
const mapsRoutes = require("./routes/maps");
const pinsRoutes = require("./routes/pins");
const favouritesRoutes = require("./routes/favourites");



// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/users", usersRoutes(db));
//app.use("/widgets", widgetsRoutes(db));
app.use("/maps", mapsRoutes(db));
// Note: mount other resources here, using the same pattern above
app.use("/pins", pinsRoutes(db));
app.use("/favourites", favouritesRoutes(db));
// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
    let templateVars = {};
    templateVars.username = req.session.username;
    templateVars.user_id = req.session.user_id;
    res.render("index", templateVars);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
