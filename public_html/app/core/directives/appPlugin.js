'use strict';

var app = angular.module('mainApp');
app.directive("appPlugin", () => {
	return {
		restrict: "E",
		replace: true,
		template: '<ng-include src="getTemplate()" include-replace />',
		link: ($scope, element, attrs) => {
			$scope.getTemplate = () => {
				if (!!attrs.template)
					return attrs.template;
			}
		}
	}
});