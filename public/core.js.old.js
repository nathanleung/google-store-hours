// angular.module("storeApp", []);
var storeApp = angular.module("storeApp", ["ngRoute", "uiGmapgoogle-maps"]);
// configure our routes
storeApp.config(["$routeProvider", "uiGmapGoogleMapApiProvider", function($routeProvider, GoogleMapApi) {
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
		GoogleMapApi.configure({
			key: "AIzaSyDCSm68_pS6RDQ0MILKkEzPApAJsx6QEF8",
			v: "3",
			libraries: "weather,geometry,visualization"
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
storeApp.controller("SearchController", ["$scope", "uiGmapGoogleMapApi", function($scope, uiGmapGoogleMapApi) {
	// Do stuff with your $scope.
	// Note: Some of the directives require at least something to be defined originally!
	// e.g. $scope.markers = []

	// uiGmapGoogleMapApi is a promise.
	// The "then" callback function provides the google.maps object.
	$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
	uiGmapGoogleMapApi.then(function(maps) {
		// $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
		var autocomplete = maps.places.Autocomplete(input);
	});
}]);