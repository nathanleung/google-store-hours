// server.js

	// set up ========================
	var express  = require("express");
	var app      = express();                               // create our app w/ express
	var mongoose = require("mongoose");                     // mongoose for mongodb
	// var morgan = require("morgan");             // log requests to the console (express4)
	var bodyParser = require("body-parser");    // pull information from HTML POST (express4)
	var methodOverride = require("method-override"); // simulate DELETE and PUT (express4)
	var config = require("./config");
	var Promise = require("bluebird");
	var googleMapsClient = require("@google/maps").createClient({
		key: config.apiKey,
		Promise: Promise
	});
	var savedPlaceIds = ["ChIJZVVVlfLU1IkRGbZkZh5VyTw", "ChIJH_38MlvU1IkR8mDX2-VDmh0"]; // TODO: replace with database
	// configuration =================
 	mongoose.Promise = Promise;
	mongoose.connect("mongodb://localhost/test");     // connect to mongoDB database

	app.use(express.static(__dirname + "/public"));                 // set the static files location /public/img will be /img for users
	// app.use(morgan("dev"));                                         // log every request to the console
	app.use(bodyParser.urlencoded({"extended":"true"}));            // parse application/x-www-form-urlencoded
	app.use(bodyParser.json());                                     // parse application/json
	app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json
	app.use(methodOverride());
	// db connection start
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {
		// we're connected!
		console.log("Connected to DB");
	});
	var storeSchema = mongoose.Schema({
		placeId: {type: String, index: {unique: true}},
		name: String,
		address: String,
		open: [{type: Number}], // opening hours 0 index from Sunday
		close: [{type: Number}], // closing hours 0 index form Sunday
		weekdayText: [{type: String}], // Text of the opening-closing hours 0 index from Sunday
		createTime: Date,
		editTime: Date
	});
	var Store = mongoose.model('Store', storeSchema);
// routes ======================================================================
	function getWeekday(date, dayFilter) {
		var day = (dayFilter >= 0) ? dayFilter : (date || new Date()).getDay();
		return (day) ? (day - 1) : 6;
	}

	function isOpen(place, dayFilter) {
		var date = new Date(),
			day = getWeekday(date, dayFilter),
			openHour = place.open[day],
			closeHour = place.close[day],
			curTime;
		if (place.open.length === 1 && place.open[0] === 0 && closeHour == null) return true;
		curTime = date.getHours() * 100 + date.getMinutes();
		return curTime > openHour && curTime < closeHour;
	}

	function fromAPI(place) {
		var openNow, hours;
		if (place) {
			if (place.opening_hours) {
				openNow = (place.opening_hours.open_now) ? "Open" : "Closed";
				hours = place.opening_hours.weekday_text[getWeekday()];
			}
			return {
				id: place.place_id,
				name: place.name,
				address: place.formatted_address,
				openNow: openNow,
				hours: hours
			};
		}
	}

	function fromDB(place, dayFilter) {
		return {
			id: place.placeId,
			name: place.name,
			address: place.address,
			openNow: (isOpen(place, dayFilter)) ? "Open" : "Closed",
			hours: place.weekdayText[getWeekday(null, dayFilter)]
		}
	}

	function getSavedPlaces(dayFilter) {
		var results = [];
		// TODO: update db if items is older than 30 days
		return Store.find({}).exec()
		.then(function(stores) {
			for (var i = 0; i < stores.length; i++) {
				results.push(fromDB(stores[i], dayFilter));
			}
			return results;
		});
	}

	// api ---------------------------------------------------------------------
	app.post("/api/readSavedPlaces", function(req, res) {
		// console.log(req.params("date"));
		var body = req.body; // TODO: validation
		return getSavedPlaces(body.date)
		.then(function(results) {
			return res.json(results);
		});
	});

	function savePlaceDetailToDBS(placeId) {
		return Store.findOne({placeId: placeId}, {_id: 1}).exec()
		.then(function(store) {
			if (store) return;
			return googleMapsClient.place({
				placeid: placeId
			}).asPromise()
			.then(function(response) {
				var place = response.json.result,
					weekdayText,
					periods;
				var store = new Store({
					name: place.name,
					placeId: place.place_id,
					address: place.formatted_address,
					open: [],
					close: [],
					createTime: new Date()
				});
				store.editTime = store.createTime;
				if (place.opening_hours && (weekdayText = place.opening_hours.weekday_text)) {
					store.weekdayText = weekdayText;
				}
				if (place.opening_hours && (periods = place.opening_hours.periods)) {
					for (var i = 0; i < periods.length; i++) {
						var period = periods[i],
							day = period.open && period.open.day;
						if (period.open) {
							store.open[day] = (period.open.time);
						}
						if (period.close) {
							store.close[day] = (period.close.time);
						}
					}
				}
				store.save()
				.then(function(doc) {
					console.log(doc.name);
				})
				.then(null, function(err) {
					console.log(err);
				});
			});
		});
	}
	app.post("/api/savePlace", function(req, res) {
		console.log(req.body);
		var body = req.body; // TODO: validation
		return savePlaceDetailToDBS(body.placeId)
		.then(function() {
			return res.json({msg: "Good"});
		})
	});

	app.post("/api/removePlace", function(req, res) {
		var body = req.body,
			index;
		return Store.remove({
			placeId: body.id
		})
		.then(function() {
			return res.json({msg: "Good"});
		})
		.then(null, function(err) {
			console.log(err);
		});
	});

	// listen (start app with node server.js) ======================================
	app.listen(8080);
	console.log("App listening on port 8080");