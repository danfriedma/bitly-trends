'use strict';

angular.module('controllers', ['ui.bootstrap','dialogs'])
.controller('Ctrl', function($scope, $http, $dialogs) {

	$scope.data = [];

	$scope.ranges = [
		{ label: 'last 5 minutes', seconds: 300},
		{ label: 'last 30 minutes', seconds: 1800},
		{ label: 'last hour', seconds: 3600}
	];

	$scope.select = {};
	$scope.select.seconds = $scope.ranges[2].seconds;

	window.onload = function() {
		getlines($scope.select.seconds);

	};

	$scope.$watch('select', function(newSelect) {
		getlines(newSelect.seconds);
	}, true);


	var getlines = function(range) {
		$http.get('/lines/' + range)
			.success(function(data) {
				$.extend($scope.data, data);
			})
			.error(function(data) {
				console.log('error' + data);
			});
	};

	$scope.open = function() {

		var dlg = $dialogs.create('/about', 'dialogCtrl', [$scope.ranges, $scope.select], {});
		dlg.result.then(function(seconds){
			$scope.select.seconds = seconds;
		}, function(){
		});
	};

})
.controller('dialogCtrl', function($scope, $modalInstance, data) {

	$scope.ranges = data[0];
	$scope.select = data[1];

	$scope.ok = function() {
		$modalInstance.close($scope.select.seconds);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

});