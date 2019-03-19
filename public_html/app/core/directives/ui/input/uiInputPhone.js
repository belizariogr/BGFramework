'use strict';

var app = angular.module('mainApp');
app.directive("uiInputPhone", ['$timeout', $timeout => {
	return {
		restrict: "E",
		template: '<div class="edit-row {{errors[fieldName] ? \'has-error\': \'\'}}"><div class="edit-row-label-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label">{{::label}}</label></div><div class="edit-row-input"><input class="form-control" ng-model="value" type="tel" id="{{::fieldId}}" placeholder="{{::placeholder}}" mask="{{mask || \'9\'}}" clean="true" ng-readonly="readOnly"></div></div>',
		replace: true,
		scope: {
			fieldId: '@',
			fieldName: '@',
			value: '=',
			labelSize: '@',
			readOnly: '@'
		},
		link: ($scope, element, attrs) => {
			$scope.number = $scope.value;
			$scope.labelSize = $scope.labelSize || 3;
			$scope.label = $scope.fieldName;
			$scope.fieldId = $scope.fieldId || ("input_" + $scope.fieldName);
			$scope.f = $scope.$parent.config.findField($scope.fieldName);
			$scope.errors = $scope.$parent.errors;
			$scope.mask = app.lang.l.masks.phone || '(99)9?9999-9999';
			if (!$scope.f) return;
			try{
				$scope.placeholder = app.lang.l["res_" + $scope.$parent.config.path].fields[$scope.f.name] || $scope.f.displayLabel || $scope.f.name;
			}catch(err){
				$scope.placeholder = $scope.f.displayLabel || $scope.f.name;
			};
			$scope.label = $scope.placeholder + ($scope.f.required ? '*' : '');
			$scope.$watch(scope => scope.value, (newValue, oldValue) => {
				if (newValue == "")
					$timeout(() => $scope.$apply(() => $scope.value = null));
			});
			if ($scope.number)
				$timeout(() => $scope.value = $scope.number, 0)
		}
	}
}]);