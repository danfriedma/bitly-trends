'use strict';

/* Directives */

angular.module('directives', ['services'])
.directive('d3Graph', ['$window', '$timeout', 'd3Service',
	function($window, $timeout, d3Service) {

	return {
		restrict: 'EA',
		scope: {
			data: '=',
			select: '='
		},
		link: function (scope, element, attrs) {
			d3Service.d3().then(function(d3) {

				var renderTimeout;
				var data = [];
				var select = [];

				var margin = {top: 30, right: 30, bottom: 30, left: 30};

				var color = d3.scale.category10();

				var width = d3.select('body').node().offsetWidth;
				var height = d3.select('body').node().offsetHeight;

				$window.onresize = function() {
					scope.$apply();
				};

				scope.$watch(function() {
					return angular.element($window)[0].innerWidth;
				}, function() {
					scope.render(scope.data, scope.select, 0);
				});

				scope.$watch('data', function(newData) {
					scope.render(newData, scope.select, 0);
				}, true);

				scope.$watch('select', function(newSelect) {
					scope.render(scope.data, newSelect, 0);
				}, true);

				var rect = d3.select('body').append('svg')
					.style('width', '100%')
					.style('height', '100%');

				var loading = rect.append('svg')
					/*.attr('y', height/2)
					.attr('x', width/2);*/
					/*.attr("transform", "translate(0," + width/2 + ")");*/
					/*.attr('viewBox', '-18 -18 36 36');*/
					.attr('viewBox', '-100 -100 200 200');

				var svg = d3.select('body').append('svg')
					.style('width', '100%')
					.style('height', '100%');

				var defs = loading.append('defs');
				
				defs.append('circle')
					.attr('id', 'ref')
					.attr('cx', '10')
					.attr('cy', '10')
					.attr('r', '4');

				var g = loading.append('g')
					.attr('id', 'a');

				g.append('use')
					.attr('xlink:href', '#ref')
					.style('fill', '#adadad')
					.style('fill-opacity', '0.5')
					.style('stroke-width', '0');

				g.append('use')
					.attr('xlink:href', '#ref')
					.attr('transform', 'rotate(45)')
					.style('fill', '#adadad')
					.style('fill-opacity', '0.5');

				g.append('use')
					.attr('xlink:href', '#ref')
					.attr('transform', 'rotate(90)')
					.style('fill', '#c1c1c1')
					.style('fill-opacity', '0.56862745');

				g.append('use')
					.attr('xlink:href', '#ref')
					.attr('transform', 'rotate(135)')
					.style('fill', '#d7d7d7')
					.style('fill-opacity', '0.67843161');
				
				g.append('use')
					.attr('xlink:href', '#ref')
					.attr('transform', 'rotate(180)')
					.style('fill', '#e9e9e9')
					.style('fill-opacity', '0.78431373');
				
				g.append('use')
					.attr('xlink:href', '#ref')
					.attr('transform', 'rotate(225)')
					.style('fill', '#f4f4f4')
					.style('fill-opacity', '0.89019608');
									
				g.append('use')
					.attr('xlink:href', '#ref')
					.attr('transform', 'rotate(270)')
					.style('fill', '#ffffff')
					.style('fill-opacity', '1');

				g.append('use')
					.attr('xlink:href', '#ref')
					.attr('transform', 'rotate(315)')
					.style('fill', '#adadad')
					.style('fill-opacity', '0.5');

				g.append('animateTransform')
					.attr('attributeName', 'transform')
					.attr('attributeType', 'XML')
					.attr('type', 'rotate')
					.attr('begin', '0s')
					.attr('dur', '0.8s')
					.attr('repeatCount', 'indefinite')
					.attr('calcMode', 'discrete')
					.attr('values', '0; 45; 90; 135; 180; 225; 270; 315; 360')
					.attr('keyTimes', '0.0; 0.1; 0.2; 0.3; 0.4; 0.5; 0.6; 0.7; 0.8');

				var tooltip = d3.select('body').append('div')
					.attr('class', 'tooltip')
					.style('opacity', 0);

				scope.render = function(data, range, resize) {
					if(resize){
						svg.selectAll('*').remove();
					}

					if (jQuery.isEmptyObject(data)) { return; }

					rect.remove();

					if(renderTimeout) { clearTimeout(renderTimeout); }

						renderTimeout = $timeout(function() {

						width = d3.select('body').node().offsetWidth;
						height = d3.select('body').node().offsetHeight;

						var x = d3.scale.linear()
							.range([0, width]);

						var y = d3.scale.log()
							.range([height, margin.top]);

						var line = d3.svg.line()
							.interpolate('basis')
							.x(function(d) { return x(d.time); })
							.y(function(d) { return y(d.rate); });

						var xmax = d3.max(data, function(p) { return d3.max(p.times, function(t) { return t.time; }); });
						var xmin = xmax - range.seconds;
						
						x.domain([xmin, xmax]);

						var ymax = d3.max(data, function(p) { return d3.max(p.times, function(t) { return t.rate; }); });
						var ymin = d3.min(data, function(p) { return d3.max(p.times, function(t) { return t.rate; }); });
						ymin = Number(ymin)*.95;

						y.domain([ymin, ymax]);

						var phrase = svg.selectAll('.phrase')
							.data(data)
							.enter().append('a')
							.attr('class', 'phrase')
							.attr('xlink:href', function(d) { return d.url; })
							.attr('xlink:show', 'new')
							.on('mouseover', function(d) {
								tooltip.text(d.phrase)
								  	.style('left', function() {
								  		if ((width - d3.event.pageX) < 200) {
								  			return (d3.event.pageX - 150) + 'px';
								  		}
								  		else {
								  			return (d3.event.pageX + 10) + 'px'; 
								  		}
								  	})
									.style('top', (d3.event.pageY - 30) + 'px');
								tooltip.transition()
									.duration(200)
									.style('opacity', 1.0);
							})
							.on('mouseout', function(d) {
								tooltip.transition()
									.duration(500)
									.style('opacity', 0);
							});

						phrase.append('path')
							.attr('class', 'line')
							.attr('d', function(d) { return line(d.times); })
							.style('stroke', function(d) { return color(d.phrase); })
							.style('stroke-width', 7.6);

						d3.selectAll('path')
							.data(data)
							.transition()
							.duration(1500)
							.attr('d', function(d) { return line(d.times); });

					}, 100);
	  			}
			})
		}
	}
}])
.directive('title', function() {
	return {
		restrict: 'E',
		replace: true,
		template: '<h1 class="title">bit.ly trends</h1>'
	};
})
.directive('about', function() {
	return {
		restrict: 'E',
		transclude: true,
		replace: true,
		template: '<button class="clean-button pure-button" ng-click="open()">About</button>'
	}
})
.directive('selector', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			ranges: '=',
			select: '='
		},
		replace: true,
		template: '<form class="pure-form"><select ng-model="select.seconds" ng-options="r.seconds as r.label for r in ranges" class="selector"></select></form>'
	};
});