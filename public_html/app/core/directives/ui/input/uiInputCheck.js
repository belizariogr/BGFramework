'use strict';

var app = angular.module('mainApp');
app.directive("uiInputCheck", function(){
	return {
		restrict: "E",
		template: '<div class="edit-row default-focus"><div class="col-md-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label-check">{{::label}}</label></div><div class="edit-row-input col-md-{{::editSize}}"><input type="checkbox"  ng-model="value" id="{{::fieldId}}" ng-readonly="readOnly"></div></div>',
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
				$scope.label = app.lang.l["res_" + $scope.$parent.config.path].fields[f.name] || f.displayLabel || f.name;
			}catch(err){
				try{
					$scope.label = f.displayLabel || f.name;
				}catch(err){
					$scope.label = f.name;
				}
			}
			$scope.label = $scope.label + (f.required ? '*' : '');
		}
	}
});