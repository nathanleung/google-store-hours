storeApp.controller("StoreController",
	["$scope", "$http", "placeService", "$filter", function($scope, $http, placeService, $filter) {
	function getSavePlaces(date) {
		$http.post("/api/readSavedPlaces", {
			date: date
		}) // TODO: reload (and icon)/handle errors
		.then(function(res) {
			$scope.stores = res.data;
			// $filter("orderBy")($scope.stores, function(store) {return store.name;});
		})
		.then(null, function(data) {
			console.log("Error: " + data);
		});
	}
	$scope.dates = [
		 "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	];
	var today = new Date().getDay();
	$scope.dateSelected = $scope.dates[today];
	getSavePlaces(today);
	$scope.setPlace = placeService.setPlace.bind(this);
	$scope.changeDate = function() {
		return getSavePlaces($scope.dates.indexOf($scope.dateSelected));
	}
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