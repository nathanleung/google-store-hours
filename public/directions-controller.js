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