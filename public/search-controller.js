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