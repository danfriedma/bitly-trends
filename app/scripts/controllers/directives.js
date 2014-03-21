'use strict';

/* Directives */

angular.module('directives', ['services'])
.directive('d3Graph', ['$window', '$timeout', 'd3Service',
	function($window, $timeout, d3Service) {

	return {
		restrict: 'EA',
		scope: {
			data: '=' // bi-directional data-binding
		},
		link: function (scope, element, attrs) {
			d3Service.d3().then(function(d3) {

				var renderTimeout;
				var data = [];

				var margin = {top: 40, right: 80, bottom: 30, left: 50};

				var color = d3.scale.category10();

				var svg = d3.select("body").append("svg")
					.style('width', '100%')
					.style('height', '100%');

				var tooltip = d3.select("body").append("div")
					.attr("class", "tooltip")               
					.style("opacity", 0);

			    $window.onresize = function() {
			        scope.$apply();
			    };

			    scope.$watch(function() {
			        return angular.element($window)[0].innerWidth;
			    }, function() {
			        scope.render(scope.data, 1);
			    });

			    scope.$watch('data', function(newData) {
			        scope.render(newData, 0);
			    }, true);

			    scope.render = function(data, resize) {
		        
			      	if(resize){
			      		svg.selectAll('*').remove();
			      	}

			        if (jQuery.isEmptyObject(data)) return;

			        if(renderTimeout) clearTimeout(renderTimeout);

			        renderTimeout = $timeout(function() {

			        var w = d3.select("body").node().offsetWidth;
					var h = d3.select("body").node().offsetHeight;

					var x = d3.scale.linear()
					    .range([0, w]);

					var y = d3.scale.log()
					    .range([h - margin.top - margin.bottom , 0]);

				    var line = d3.svg.line()
				   		.interpolate("cardinal")
				   		.x(function(d, i) { return x(i); })
				   		.y(function(d) { return y(d.rate); });

			      	var nest = d3.nest()
				        	.key(function(d) { return d.phrase })
				        	.entries(data);

					x.domain([0, nest[0].values.length - 1]);

					y.domain([
						d3.min(nest, function(p) { return d3.min(p.values, function(v) { return v.rate }); }),
					    .5 + d3.max(nest, function(p) { return d3.max(p.values, function(v) { return v.rate }); })
					]);

					var url = function(d) {
						return d[0].urls[0].aggregate_url;
					}
						
					var getphrase = function(d) {
						console.log(d[0].phrase);
						return d[0].phrase;
					}

				  	var phrase = svg.selectAll(".phrase")
				      	.data(nest)
				    	.enter().append("a")
				      	.attr("class", "phrase")
				      	.attr("xlink:href", function(d) { return url(d.values); })
				      	.attr("xlink:show", "new")
				      	.on("mouseover", function(d) {      
			    		tooltip.text(getphrase(d.values))
			    		  	.style("left", (d3.event.pageX + 10) + "px")     
			        		.style("top", (d3.event.pageY - 30) + "px");   
			    		tooltip.transition()        
			        		.duration(200)      
			        		.style("opacity", .6);      
			        	})
						.on("mouseout", function(d) {       
		    			tooltip.transition()        
		        			.duration(500)      
		        			.style("opacity", 0);   
						});

					phrase.append("path")
					    .attr("class", "line")
					    .attr("d", function(d) { return line(d.values); })
					    .style("stroke", function(d) { return color(d.key); });

					d3.selectAll("path")
					    .data(nest)
					  	.transition()
					    .duration(500)
						.attr("d", function(d) { return line(d.values); });

			        }, 200);
	  			}

	  			scope.render(data, 1);
			})
		}
	}
}])
