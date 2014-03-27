'use strict';

/* Directives */

angular.module('directives', ['services'])
.directive('d3Graph', ['$window', '$timeout', 'd3Service',
	function($window, $timeout, d3Service) {

	return {
		restrict: 'EA',
		scope: {
			data: '=',
			range: '='
		},
		link: function (scope, element, attrs) {
			d3Service.d3().then(function(d3) {

				var renderTimeout;
				var data = [];
				var range = [];

				var margin = {top: 30, right: 30, bottom: 30, left: 30};

				$window.onresize = function() {
					scope.$apply();
				};

				scope.$watch(function() {
					return angular.element($window)[0].innerWidth;
				}, function() {
					scope.render(scope.data, scope.range, 1);
				});

				scope.$watch('data', function(newData) {
					scope.render(newData, scope.range, 1);
				}, true);

				scope.$watch('range', function(newRange) {
					scope.render(scope.data, newRange, 0);
				}, true);

				var svg = d3.select('body').append('svg')
					.style('width', '100%')
					.style('height', '100%');

				var tooltip = d3.select('body').append('div')
					.attr('class', 'tooltip')
					.style('opacity', 0);

				scope.render = function(data, range, resize) {

					if(resize){
						svg.selectAll('*').remove();
					}

					if (jQuery.isEmptyObject(data)) { return; }

					if(renderTimeout) { clearTimeout(renderTimeout); }

					renderTimeout = $timeout(function() {

					var width = d3.select('body').node().offsetWidth;
					var height = d3.select('body').node().offsetHeight;

					var x = d3.scale.linear()
						.range([0, width]);

					var y = d3.scale.log()
						.range([height - margin.bottom, margin.top]);

					var line = d3.svg.line()
						.interpolate('cardinal')
						.x(function(d) { return x(d.time); })
						.y(function(d) { return y(d.rate); });

					var xmax = d3.max(data, function(p) { return d3.max(p.times, function(t) { return t.time; }); });
					var xmin = xmax - range.seconds;
					
					x.domain([xmin, xmax]);

					var ymax = d3.max(data, function(p) { return d3.max(p.times, function(t) { return t.rate; }); });
					/*var ymin = d3.min(data, function(p) { return d3.max(p.times, function(t) { return t.rate; }); });*/

					y.domain([ .55, ymax]);

					var color = d3.scale.linear()
						.domain([.55, ymax])
						.range(["blue", "red"]);

					var phrase = svg.selectAll('.phrase')
						.data(data)
						.enter().append('a')
						.attr('class', 'phrase')
						.attr('xlink:href', function(d) { return d.url; })
						.attr('xlink:show', 'new')
						.on('mouseover', function(d) {
							tooltip.text(d.phrase)
							  	.style('left', (d3.event.pageX + 10) + 'px')
								.style('top', (d3.event.pageY - 30) + 'px');
							tooltip.transition()
								.duration(200)
								.style('opacity', .6);
						})
						.on('mouseout', function(d) {
							tooltip.transition()
								.duration(500)
								.style('opacity', 0);
						});

					phrase.append('path')
						.attr('class', 'line')
						.attr('d', function(d) { return line(d.times); })
						.style('stroke', function(d) { return color(d3.max(d.times, function(t) { return t.rate; })); })
						.style('stroke-width', 4.5);

					d3.selectAll('path')
						.data(data)
						.transition()
						.duration(3000)
						.attr('d', function(d) { return line(d.times); });

					}, 200);
	  			}
			})
		}
	}
}])
.directive('header', function() {
	return {
		restrict: 'E',
		replace: true,
		template: '<div><h1 class="title">bit.ly trends<br><span class="intro">Hover to explore  //  Click to read</span></h1></div>'
	};
})
.directive('selector', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			ranges: '=',
			range: '=',
		},
		replace: true,
		template: '<form class="selector pure-form"><select ng-model="range" ng-options="r.name for r in ranges" class="selector"></select></form>'
	};
});