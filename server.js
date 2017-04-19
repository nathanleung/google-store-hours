// server.js

	// set up ========================
	var express  = require('express');
	var app      = express();                               // create our app w/ express
	// var mongoose = require('mongoose');                     // mongoose for mongodb
	// var morgan = require('morgan');             // log requests to the console (express4)
	var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
	var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
	var googleMapsClient = require('@google/maps').createClient({
		key: "AIzaSyCu06tFv4xfsQONE-FRfcie4VDrdcSyrpA",
		Promise: require('q').Promise
	});
	var savedPlaceIds = ["ChIJZVVVlfLU1IkRGbZkZh5VyTw"]; // TODO: replace with database
	// configuration =================

	// mongoose.connect('mongodb://node:nodeuser@mongo.onmodulus.net:27017/uwO3mypu');     // connect to mongoDB database on modulus.io

	app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
	// app.use(morgan('dev'));                                         // log every request to the console
	app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
	app.use(bodyParser.json());                                     // parse application/json
	app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
	app.use(methodOverride());
// routes ======================================================================

	// api ---------------------------------------------------------------------
	// TODO: search for place
	app.get('/api/searchForPlace', function(req, res) {
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
		return googleMapsClient.place({
			placeid: places[index]
		}).asPromise()
		.then(function(response) {
			// TODO: handle no response or attributes
			var place = response.json.result,
				day = (new Date()).getDay(),
				weekday = (day) ? (day - 1) : 6,
				openNow = (place.opening_hours.open_now) ? "Open" : "Closed",
				hours = place.opening_hours.weekday_text[weekday];
			results.push({
				name: place.name,
				openNow: openNow,
				hours: hours
			});
			console.log(results);
			index++;
			if (!places[index]) return results;
			return recursiveLook(places, results, index);
		})
	}

	app.get("/api/readSavedPlaces", function(req, res) {
		return recursiveLook(savedPlaceIds, [], 0)
		.then(function(places) {
			res.json(places);
		})
	});

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});

	// listen (start app with node server.js) ======================================
	app.listen(8080);
	console.log("App listening on port 8080");