'use strict';

var app = angular.module('mainApp');
app.directive("uiFilterColumn", function($compile){
	return {
		restrict: "E",
		template: "",
		scope: {
			filters: '='
		},
		link: function($scope, element, attrs){
			var i = -1;
			$scope.filters.forEach(function(f){
				i++;
				switch(f.type){
					case "month":
						element.append($compile('<ui-month-filter filter="filters[' + i + ']"></ui-month-filter>')($scope));
						break;
					case "date":
						element.append($compile('<ui-date-filter filter="filters[' + i + ']"></ui-date-filter>')($scope));
						break;
					case "bool":
						element.append($compile('<ui-bool-filter filter="filters[' + i + ']"></ui-bool-filter>')($scope));
						break;
					case "options":
						element.append($compile('<ui-options-filter filter="filters[' + i + ']"></ui-options-filter>')($scope));
						break;
				}
			});

		}
	}
});