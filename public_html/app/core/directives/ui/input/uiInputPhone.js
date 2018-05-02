'use strict';

var app = angular.module('mainApp');
app.directive("uiInputPhone", ['$timeout', function($timeout){
	return {
		restrict: "E",
		template: '<div class="edit-row"><div class="col-md-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label">{{::label}}</label></div><div class="edit-row-input col-md-{{::editSize}}"><input class="form-control" ng-model="value" type="tel" id="{{::fieldId}}" placeholder="{{::placeholder}}" mask="(99)9?9999-9999" clean="true" ng-readonly="readOnly"></div></div>',
		replace: true,
		scope: {
			fieldId: '@',
			field: '@',
			value: '=',
			size: '@',
			readOnly: '@'
		},
		link: function($scope, element, attrs){
			$scope.labelSize = $scope.labelSize || 3;
			$scope.editSize = $scope.size || 12 - $scope.labelSize;
			$scope.label = $scope.field;
			$scope.f = $scope.$parent.config.findField($scope.field);
			if (!$scope.f) return;
			try{
				$scope.placeholder = app.lang.l["res_" + $scope.$parent.config.path].fields[$scope.f.name] || $scope.f.displayLabel || $scope.f.name;
			}catch(err){
				$scope.placeholder = $scope.f.displayLabel || $scope.f.name;
			};
			$scope.label = $scope.placeholder + ($scope.f.required ? '*' : '');
			$scope.$watch('value', function(newValue, oldValue) {
				if (newValue == "") {
					$timeout(function(){
						$scope.$apply(function(){
							$scope.value = null;
						})
					})
				}
			});
		}
	}
}]);