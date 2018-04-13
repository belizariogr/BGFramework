'use strict';

var app = angular.module('mainApp');
app.directive("uiInputText", function(){
	return {
		restrict: "E",
		template: '<div class="edit-row default-focus"><div class="col-md-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label">{{::label}}</label></div><div class="edit-row-input col-md-{{::editSize}}"><input class="form-control" ng-model="value" type="text" id="{{::fieldId}}" placeholder="{{::placeholder}}" ng-readonly="readOnly"></div></div>',
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
			var f = $scope.$parent.config.findField($scope.field);
			try{
				$scope.placeholder = app.lang.l["res_" + $scope.$parent.config.path].fields[f.name];
			}catch(err){
				try{
					$scope.placeholder = f.displayLabel || f.name;
				}catch(err){
					$scope.placeholder = f.name;
				}
			}

			$scope.label = $scope.placeholder + (f.required ? '*' : '');
		}
	}
});