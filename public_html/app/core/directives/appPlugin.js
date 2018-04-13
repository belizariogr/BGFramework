'use strict';

var app = angular.module('mainApp');
app.directive("appPlugin", function(){
	return {
		restrict: "E",
		replace: true,
		template: '<ng-include src="getTemplate()" include-replace />',
		link: function($scope, element, attrs){
			$scope.getTemplate = function(){
				if (!!attrs.template)
					return attrs.template;
			}
		}
	}
});