'use strict';

var app = angular.module('mainApp');
app.directive("uiInputMemo", function(){
	return {
		restrict: "E",
		template: '<div class="edit-row"><div class="col-md-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label">{{::label}}</label></div><div class="edit-row-input col-md-{{::editSize}}"><textarea rows="{{::rows}}" class="form-control" ng-model="value" id="{{::fieldId}}" placeholder="{{::placeholder}}" ng-readonly="readOnly"/></div></div>',
		replace: true,
		scope: {
			fieldId: '@',
			field: '@',
			value: '=',
			size: '@',
			rows: '@',
			readOnly: '@'
		},
		link: function($scope, element, attrs){
			$scope.labelSize = $scope.labelSize || 3;
			$scope.editSize = $scope.size || 12 - $scope.labelSize;
			$scope.rows = $scope.rows || 4;
			$scope.label = $scope.field;
			$scope.f = $scope.$parent.config.findField($scope.field);
			if (!$scope.f) return;
			try{
				$scope.placeholder = app.lang.l["res_" + $scope.$parent.config.path].fields[$scope.f.name] || $scope.f.displayLabel || $scope.f.name;
			}catch(err){
				$scope.placeholder = $scope.f.displayLabel || $scope.f.name;
			};
			$scope.label = $scope.placeholder + ($scope.f.required ? '*' : '');
		}
	}
});