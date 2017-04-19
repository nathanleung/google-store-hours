// public/core.js
// var scotchTodo = angular.module('scotchTodo', []);

// scotchTodo.controller("mainController", ["$scope", "$http", function($scope, $http) {
// 	$http.get('/api/todos')
// 	.then(function(res) {
// 		$scope.todos = res.data;
// 		console.log(res.data);
// 	},
// 	function(data) {
// 		console.log('Error: ' + data);
// 	});

// }]);

angular.module("storeCards", []);
angular
	.module("storeCards")
	.controller("StoreController", ["$scope", "$http", function($scope, $http) {
		$http.get('/api/readSavedPlaces')
		.then(function(res) {
			$scope.stores = res.data;
			console.log(res.data);
		},
		function(data) {
			console.log('Error: ' + data);
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
	}])
	.directive("storeCards", function () {
		return {
			templateUrl: "store-card.template.html"
		};
	});