'use strict';

var app = angular.module('mainApp');
app.directive("uiErrorMessage", function(){
	return {
		restrict: "E",
		transclude: true,
		template: '<div class="ui-error alert alert-danger" ng-transclude></div>'
	}
});
