// angular.module("storeApp", []);
var storeApp = angular.module("storeApp", ["ngRoute", "ngMap", "ui.materialize"]);
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