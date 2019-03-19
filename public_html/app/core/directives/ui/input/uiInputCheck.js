'use strict';

var app = angular.module('mainApp');
app.directive("uiInputCheck", () => {
	return {
		restrict: "E",
		template: '<div class="edit-row"><div class="edit-row-label-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label-check">{{::label}}</label></div><div class="edit-row-input"><input type="checkbox" ng-model="value" id="{{::fieldId}}" ng-readonly="readOnly"></div></div>',
		replace: true,
		scope: {
			fieldId: '@',
			fieldName: '@',
			value: '=',
			labelSize: '@',
			readOnly: '@'
		},
		link: ($scope, element, attrs) => {
			$scope.labelSize = $scope.labelSize || 3;
			$scope.label = $scope.fieldName;
			$scope.fieldId = $scope.fieldId || ("input_" + $scope.fieldName);
			$scope.f = $scope.$parent.config.findField($scope.fieldName);
			if (!$scope.f) return;
			try {
				$scope.label = app.lang.l["res_" + $scope.$parent.config.path].fields[$scope.f.name] || $scope.f.displayLabel || $scope.f.name;
			} catch(err) {
				$scope.label = $scope.f.displayLabel || $scope.f.name;
			}
			$scope.label = $scope.label + ($scope.f.required ? '*' : '');
		}
	}
});