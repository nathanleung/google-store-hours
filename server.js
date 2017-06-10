// server.js

	// set up ========================
	var express  = require("express");
	var app      = express();                               // create our app w/ express
	// var mongoose = require("mongoose");                     // mongoose for mongodb
	// var morgan = require("morgan");             // log requests to the console (express4)
	var bodyParser = require("body-parser");    // pull information from HTML POST (express4)
	var methodOverride = require("method-override"); // simulate DELETE and PUT (express4)
	var config = require("./config");
	var Promise = require("bluebird");
	var googleMapsClient = require("@google/maps").createClient({
		key: config.apiKey,
		// Promise: require("q").Promise
		Promise: Promise
	});
	var savedPlaceIds = ["ChIJZVVVlfLU1IkRGbZkZh5VyTw", "ChIJH_38MlvU1IkR8mDX2-VDmh0"]; // TODO: replace with database
	// configuration =================

	// mongoose.connect("mongodb://node:nodeuser@mongo.onmodulus.net:27017/uwO3mypu");     // connect to mongoDB database on modulus.io

	app.use(express.static(__dirname + "/public"));                 // set the static files location /public/img will be /img for users
	// app.use(morgan("dev"));                                         // log every request to the console
	app.use(bodyParser.urlencoded({"extended":"true"}));            // parse application/x-www-form-urlencoded
	app.use(bodyParser.json());                                     // parse application/json
	app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json
	app.use(methodOverride());
// routes ======================================================================

	// api ---------------------------------------------------------------------
	app.get("/api/readSavedPlaces", function(req, res) {
		var promises = [],
			results = [],
			i, j;
		for (i = 0; i < savedPlaceIds.length; i++) {
			promises.push(googleMapsClient.place({
				placeid: savedPlaceIds[i]
			}).asPromise());
		}
		return Promise.all(promises)
		.then(function(responses) {
			for (j = 0; j < responses.length; j++) {
				// TODO: handle no response or attributes
				var response = responses[j],
					place = response.json.result,
					day, weekday, openNow, hours;
				if (place) {
					day = (new Date()).getDay();
					weekday = (day) ? (day - 1) : 6;
					if (place.opening_hours) {
						openNow = (place.opening_hours.open_now) ? "Open" : "Closed";
						hours = place.opening_hours.weekday_text[weekday];
					}
					results.push({
						id: place.place_id,
						name: place.name,
						address: place.formatted_address,
						openNow: openNow,
						hours: hours
					});
				}
			}
			console.log(results);
			return res.json(results);
		})
		.then(null, function(error) {
			console.log(error);
			return res.json(error);
		});
	});

	app.post("/api/savePlace", function(req, res) {
		console.log(req.body);
		var body = req.body; // TODO: validation
		if (savedPlaceIds.indexOf(body.placeId)) savedPlaceIds.push(body.placeId);
		return res.json({msg: "Good"});
	});

	app.post("/api/removePlace", function(req, res) {
		var body = req.body,
			index;
		if ((index = savedPlaceIds.indexOf(body.id)) !== -1)
			savedPlaceIds.splice(index, 1);
		return res.json({msg: "Good"});
	});

	// listen (start app with node server.js) ======================================
	app.listen(8080);
	console.log("App listening on port 8080");