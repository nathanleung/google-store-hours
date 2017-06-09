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
		});
}]);
storeApp.controller("StoreController", ["$scope", "$http", function($scope, $http) {
	$http.get("/api/readSavedPlaces")
	.then(function(res) {
		$scope.stores = res.data;
		console.log(res.data);
	},
	function(data) {
		console.log("Error: " + data);
	});
	$scope.searchText = "";
	$scope.searchForPlace = function() {
		console.log($scope.searchText);
		$http.get("/api/searchForPlace", {
			params: {
				searchText: $scope.searchText
			}
		});
	}
}]);
storeApp.controller("SearchController", ["$scope", "$http", "NgMap", function($scope, $http, NgMap) {
	$scope.types = "[]";
	// $scope.markerPosition = "43.855791, -79.335182";
	// TODO: fix console error: InvalidValueError: setTypes: not an Array
	$scope.placeDetail = {};
	$scope.placeChanged = function() {
		$scope.place = this.getPlace();
		$scope.markerPosition = $scope.place.geometry.location.lat() + ", " + $scope.place.geometry.location.lng();
		console.log('location', $scope.place.geometry.location);
		$scope.placeDetail.address = $scope.place.formatted_address;
		$scope.markerVisible = true;
		$scope.map.setCenter($scope.place.geometry.location);
	}
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
	}
	NgMap.getMap().then(function(map) {
		$scope.map = map;
		console.log(map.getCenter());
		console.log('markers', map.markers);
		console.log('shapes', map.shapes);
	});
}]);