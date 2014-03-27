'use strict';

angular.module('controllers', [])
.controller('Ctrl', function($scope, $http) {

	$scope.data = [];

	$scope.ranges = [
		{name: 'last 5 minutes', seconds: 300},
		{name: 'last 30 minutes', seconds: 1800},
		{name: 'last hour', seconds: 3600}
	];

	$scope.range = $scope.ranges[1];
	
	window.onload = function() {
		$http.get('/api/lines')
			.success(function(data) {
				$scope.data = data;
			})
			.error(function(data) {
				console.log('error');
			});
	};

// For making a websocket connection to server
/*	window.onload = function() {
		var host = location.origin.replace(/^http/, 'ws')
		var ws = new WebSocket(host);
		ws.onmessage = function (event) {
			$scope.$apply($scope.data.push(JSON.parse(event.data)));
		};
	}*/
});