'use strict';

angular.module('controllers', [])
.controller('SocketCtrl', function($scope) {

	$scope.data = [];

	window.onload = function() {
		var host = location.origin.replace(/^http/, 'ws')
		var ws = new WebSocket(host);
		ws.onmessage = function (event) {
			$scope.$apply($scope.data.push(JSON.parse(event.data)));
		};
	}
});