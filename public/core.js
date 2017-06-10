// angular.module("storeApp", []);
var storeApp = angular.module("storeApp", ["ngRoute", "ngMap"]);
// configure our routes
storeApp.config(["$routeProvider", function($routeProvider) {
	$routeProvider
		// route for the home page
		.when("/", {
			templateUrl : "store-card.template.html",
			controller  : "StoreController"
		})
		// route for the cards
		.when("/cards", {
			templateUrl : "store-card.template.html",
			controller  : "StoreController"
		})
		// route for the list
		.when("/list", {
			templateUrl : "store-list.template.html",
			controller  : "StoreController"
		})
		// route for the search
		.when("/search", {
			templateUrl : "store-search.template.html",
			controller  : "SearchController"
		})
		// route for the directions
		.when("/directions", {
			templateUrl : "store-directions.template.html",
			controller  : "DirectionsController"
		});
}]);
storeApp.controller("StoreController", ["$scope", "$http", "placeService", function($scope, $http, placeService) {
	$http.get("/api/readSavedPlaces")
	.then(function(res) {
		$scope.stores = res.data;
		console.log(res.data);
	},
	function(data) {
		console.log("Error: " + data);
	});
	$scope.setPlace = placeService.setPlace.bind(this);
	$scope.removePlace = function(store) {
		$http.post("api/removePlace", {
			id: store.id
		})
		.then(function(res) {
			console.log(res);
		})
		.then(null, function(err) {
			console.log(err);
		})
	};
}]);
storeApp.controller("SearchController", ["$scope", "$http", "NgMap", function($scope, $http, NgMap) {
	$scope.types = "[]";
	$scope.placeDetail = {};
	$scope.placeChanged = function() {
		$scope.place = this.getPlace();
		if (!$scope.place.place_id) return; // TODO: validation or user message
		$scope.markerPosition = $scope.place.geometry.location.lat() + ", " + $scope.place.geometry.location.lng();
		console.log('location', $scope.place.geometry.location);
		$scope.placeDetail.address = $scope.place.formatted_address;
		$scope.markerVisible = true;
		$scope.map.setCenter($scope.place.geometry.location);
	};
	$scope.savePlace = function() {
		var place = $scope.place;
		if (!place) return;
		$http.post("/api/savePlace", {placeId: place.place_id})
		.then(function(data) {
			return;
		})
		.then(null, function(data) {
			console.log('Error: ' + data);
		});
	};
	NgMap.getMap().then(function(map) {
		$scope.map = map;
	});
}]);
storeApp.controller("DirectionsController", ["$scope", "NgMap", "placeService", function($scope, NgMap, placeService) {
	$scope.address = placeService.getPlace();
	NgMap.getMap().then(function(map) {
		$scope.map = map;
	});
}]);
storeApp.factory('placeService', function() {
	var place_address = "";
	function setPlace(adrs) {
		place_address = adrs;
	}
	function getPlace() {
		return place_address;
	}

	return {
		setPlace: setPlace,
		getPlace: getPlace
	};
});