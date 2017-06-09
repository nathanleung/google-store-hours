// server.js

	// set up ========================
	var express  = require("express");
	var app      = express();                               // create our app w/ express
	// var mongoose = require("mongoose");                     // mongoose for mongodb
	// var morgan = require("morgan");             // log requests to the console (express4)
	var bodyParser = require("body-parser");    // pull information from HTML POST (express4)
	var methodOverride = require("method-override"); // simulate DELETE and PUT (express4)
	var config = require("./config");
	var googleMapsClient = require("@google/maps").createClient({
		key: config.apiKey,
		Promise: require("q").Promise
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
	// TODO: search for place
	app.get("/api/searchForPlace", function(req, res) {
		// TODO: 
		var searchText = req.param("searchText");
		return googleMapsClient.placesNearby({
			keyword: searchText, // from request
			location: [43.853145, -79.346512],
			radius: 1000,
			// type: "store"

		})
		.asPromise()
		.then(function(response) {
			var places = response.json.results;
			// console.log(places);
			// console.log(places[0].place_id);
			return googleMapsClient.place({
				placeid: places[0].place_id
			})
			.asPromise();
		})
		.then(function(response) {
			var place = response.json.result,
				day = (new Date()).getDay(),
				weekday = (day) ? (day - 1) : 6,
				openNow = (place.opening_hours.open_now) ? "Open" : "Closed",
				hours = place.opening_hours.weekday_text[weekday];
			console.log(place.name);
			console.log(place.place_id);
			console.log(openNow);
			console.log(hours);
			res.json([{
				name: place.name,
				openNow: openNow,
				hours: hours
			}]);
		});
	});

	function recursiveLook(places, results, index) { // TODO: some kind of Promise.all with sys.map
		console.log(places);
		return googleMapsClient.place({
			placeid: places[index]
		}).asPromise()
		.then(function(response) {
			// TODO: handle no response or attributes
			var place = response.json.result,
				day, weekday, openNow, hours;
			if (place) {
				day = (new Date()).getDay();
				weekday = (day) ? (day - 1) : 6;
				if (place.opening_hours) {
					openNow = (place.opening_hours.open_now) ? "Open" : "Closed";
					hours = place.opening_hours.weekday_text[weekday];
				}
				results.push({
					name: place.name,
					openNow: openNow,
					hours: hours
				});
			}
			console.log(results);
			index++;
			if (!places[index]) return results;
			return recursiveLook(places, results, index);
		})
		.then(null, function(error) {
			console.log(error);
			return results;
		})
	}

	app.get("/api/readSavedPlaces", function(req, res) {
		return recursiveLook(savedPlaceIds, [], 0)
		.then(function(places) {
			res.json(places);
		})
	});
// TODO: convert to angular code/modules/controllers for search.html, button to refresh view
	app.post("/api/savePlace", function(req, res) {
		console.log(req.body);
		var body = req.body; // TODO: validation
		if (savedPlaceIds.indexOf(body.placeId)) savedPlaceIds.push(body.placeId);
		res.json({});
	});

	app.get("/example", function(req, res) {
		res.sendfile("./public/place_auto_complete_example.html");
	})

	// listen (start app with node server.js) ======================================
	app.listen(8080);
	console.log("App listening on port 8080");