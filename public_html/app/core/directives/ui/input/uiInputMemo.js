'use strict';

var app = angular.module('mainApp');
app.directive("uiInputMemo", () => {
	return {
		restrict: "E",
		template: '<div class="edit-row {{errors[fieldName] ? \'has-error\': \'\'}}"><div class="edit-row-label-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label">{{::label}}</label></div><div class="edit-row-input"><textarea rows="{{::rows}}" class="form-control" ng-model="value" id="{{::fieldId}}" placeholder="{{::placeholder}}" ng-readonly="readOnly"/></div></div>',
		replace: true,
		scope: {
			fieldId: '@',
			fieldName: '@',
			value: '=',
			labelSize: '@',
			rows: '@',
			readOnly: '@'
		},
		link: ($scope, element, attrs) => {
			$scope.labelSize = $scope.labelSize || 3;
			$scope.rows = $scope.rows || 4;
			$scope.label = $scope.fieldName;
			$scope.fieldId = $scope.fieldId || ("input_" + $scope.fieldName);
			$scope.f = $scope.$parent.config.findField($scope.fieldName);
			$scope.errors = $scope.$parent.errors;
			if (!$scope.f) return;
			try{
				$scope.placeholder = app.lang.l["res_" + $scope.$parent.config.path].fields[$scope.f.name] || $scope.f.displayLabel || $scope.f.name;
			}catch(err){
				$scope.placeholder = $scope.f.displayLabel || $scope.f.name;
			};
			$scope.label = $scope.placeholder + ($scope.f.required ? '*' : '');
			$scope.$watch('value', (newValue, oldValue) => {
				if (newValue != oldValue)
					$scope.error = undefined;
			});
		}
	}
});