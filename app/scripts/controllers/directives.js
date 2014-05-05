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

				var showAxes = true;

				setTimeout(function(){
						svg.selectAll('g').transition()
							.duration(200)
							.style('opacity', 0);
						showAxes = false;
					}, 10000);

				d3.select('button#axes').on('click', function(){
					showAxes = !showAxes;
					scope.axes(showAxes);
				});

				scope.axes = function(showAxes) {
					if(showAxes) {
						svg.selectAll('g').transition()
							.duration(200)
							.style('opacity', 1);
					}
					else {
						svg.selectAll('g').transition()
							.duration(200)
							.style('opacity', 0);
					}
				};

				var renderTimeout;

				var margin = {top: 30, right: 30, bottom: 30, left: 30};

				var color = d3.scale.category10();

				var width = d3.select('div.graph-container').node().offsetWidth;
				var height = d3.select('div.graph-container').node().offsetHeight;

				var xmax, xmin, ymax, ymin = 0;

				var x = d3.scale.linear()
					.range([0, width]).domain([xmin, xmax]);

				var y = d3.scale.linear()
					.range([height - margin.bottom, margin.top]).domain([ymin, ymax]);

				var yAxis = d3.svg.axis()
				    .scale(y)
				    .orient('left');

				var xAxis = d3.svg.axis()
					.scale(x)
					.tickFormat(function(d){return d3.time.format('%H:%M')(new Date(d*1000));})
					.orient('bottom');

				$window.onresize = function() {
					scope.$apply();
				};

				scope.$watch(function() {
					return angular.element($window)[0].innerWidth;
				}, function() {
					scope.render(scope.data, scope.select);
				});

				scope.$watch('data', function(newData) {
					scope.render(newData, scope.select);
				}, true);

				scope.$watch('select', function(newSelect) {
					scope.render(scope.data, newSelect);
					showAxes = true;
					scope.axes(showAxes);
				}, true);

				var rect = d3.select('div.graph-container').append('svg')
					.style('width', '100%')
					.style('height', '100%');

				var loading = rect.append('svg')
					.attr('viewBox', '-100 -100 200 200');

				var svg = d3.select('div.graph-container').append('svg')
					.style('width', '100%')
					.style('height', '100%')
					.style('display', 'block');

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

				var tooltip = d3.select('div.graph-container').append('div')
					.attr('class', 'tooltip')
					.style('opacity', 0);

				scope.render = function(data, range) {

					if (jQuery.isEmptyObject(data)) { return; }

					rect.remove();

					if(renderTimeout) {
						clearTimeout(renderTimeout);
					}

					renderTimeout = $timeout(function() {

						width = d3.select('div.graph-container').node().offsetWidth;
						height = d3.select('div.graph-container').node().offsetHeight;

						xmax = d3.max(data, function(p) { return d3.max(p.times, function(t) { return t.time; }); });
						/*xmin = d3.min(data, function(p) { return d3.min(p.times, function(t) { return t.time; }); });*/
						xmin = xmax - range.seconds;

						ymax = d3.max(data, function(p) { return d3.max(p.times, function(t) { return t.rate; }); });
						ymin = d3.min(data, function(p) { return d3.min(p.times, function(t) { return t.rate; }); });

						x = d3.scale.linear()
							.range([0, width]).domain([xmin, xmax]);

						y = d3.scale.linear()
							.range([height - margin.bottom, margin.top]).domain([ymin, ymax]);

						var line = d3.svg.line()
							.interpolate('basis')
							.x(function(d) { return x(new Date(d.time)); })
							.y(function(d) { return y(d.rate); });

						yAxis = d3.svg.axis()
							.scale(y)
							.orient('left');

						xAxis = d3.svg.axis()
							.scale(x)
							.tickFormat(function(d){return d3.time.format('%H:%M')(new Date(d*1000));})
							.orient('bottom');

						if(svg.selectAll('g').empty()) {
							d3.select('svg').append('g')
								.attr('class', 'axis yaxis')
								.attr('transform', 'translate(30, 0)')
								.call(yAxis)
							  .append('text')
								.attr('class', 'axis-text yaxis-text')
								.attr('transform', 'rotate(-90)')
								.attr('x', -height)
								.attr('dx', '3em')
								.attr('y', 0)
								.attr('dy', '.7em')
								.style('text-anchor', 'start')
								.text('Click-Rate');

							d3.select('svg').append('g')
								.attr('class', 'axis xaxis')
								.attr('transform', 'translate(0, ' + (height - 30) + ')')
								.call(xAxis)
							  .append('text')
								.attr('class', 'axis-text xaxis-text')
								.attr('x', width)
								.attr('dx', '-1em')
								.attr('y', 0)
								.attr('dy', '0')
								.style('text-anchor', 'end')
								.text('Time');
						}

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
							.on('mouseout', function() {
								tooltip.transition()
									.duration(300)
									.style('opacity', 0.0);
							});

						phrase.append('path')
							.attr('class', 'line')
							.attr('d', function(d) { return line(d.times); })
							.style('stroke', function(d) { return color(d.phrase); })
							.style('stroke-width', 7.6);

						d3.selectAll('path')
							.data(data)
							.transition()
							.duration(700)
							.attr('d', function(d) { return line(d.times); });

						d3.selectAll('path')
							.data(data)
							.exit()
							.remove();

						svg.select('.yaxis')
							.transition()
							.duration(700)
							.ease('poly(5)-in-out')
							.call(yAxis);

						svg.select('.xaxis')
							.transition()
							.duration(700)
							.ease('poly(5)-in-out')
							.attr('transform', 'translate(0, ' + (height - 30) + ')')
							.call(xAxis);

						svg.select('.yaxis-text')
							.transition()
							.duration(700)
							.ease('poly(5)-in-out')
							.attr('x', -height);

						svg.select('.xaxis-text')
							.transition()
							.duration(700)
							.ease('poly(5)-in-out')
							.attr('x', width);

					}, 200);
				};
			});
		}
	};
}])
.directive('about', function() {
	return {
		restrict: 'E',
		transclude: true,
		replace: true,
		template: '<button class="pure-button clean-button" ng-click="open()">About</button>'
	};
})
.directive('axes', function() {
	return {
		restrict: 'E',
		transclude: true,
		replace: true,
		template: '<button id="axes" class="pure-button clean-button" ng-click="showAxes()">Toggle Axes</button>'
	};
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