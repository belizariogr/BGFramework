'use strict';

var app = angular.module('mainApp');
app.directive("uiInputNumber", ['$timeout', ($timeout) => {
	return {
		restrict: "E",
		template: '<div class="edit-row {{errors[fieldName] ? \'has-error\': \'\'}}"><div class="edit-row-label-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label">{{::label}}</label></div><div class="edit-row-input"><input class="form-control" ng-model="strValue" type="text" inputmode="numeric" id="{{::fieldId}}" placeholder="{{::placeholder}}" ng-readonly="readOnly"></div></div>',
		replace: true,
		scope: {
			fieldId: '@',
			fieldName: '@',
			value: '=',
			labelSize: '@',
			readOnly: '@',
			min: '@',
			max: '@'
		},
		link: ($scope, element, attrs) => {
			$scope.labelSize = $scope.labelSize || 3;
			$scope.label = $scope.fieldName;
			$scope.fieldId = $scope.fieldId || ("input_" + $scope.fieldName);
			$scope.input = element.find('input');
			$scope.f = $scope.$parent.config.findField($scope.fieldName);
			$scope.errors = $scope.$parent.errors;
			if (!$scope.f) return;
			try{
				$scope.placeholder = app.lang.l["res_" + $scope.$parent.config.path].fields[$scope.f.name] || $scope.f.displayLabel || $scope.f.name;
			}catch(err){
				$scope.placeholder = $scope.f.displayLabel || $scope.f.name;
			};
			$scope.getLen = () => {
				if (!$scope.strValue)
					return 0
				return $scope.strValue.length;
			}
			$($scope.input[0]).on("focus", (evt) => {setCaret($scope.input[0], $scope.getLen()); $timeout(() => setCaret($scope.input[0], $scope.getLen()))});
			$($scope.input[0]).on("focus", (evt) => setCaret($scope.input[0], $scope.strValue.length));
			$scope.format = $scope.f.format || '';
			$scope.label = $scope.placeholder + ($scope.f.required ? '*' : '');
			$scope.$watch(scope => scope.strValue, (newValue, oldValue, scope) => {
				$scope.error = undefined;
				if (newValue !== oldValue){
					var s = formatNumber(newValue + "a", $scope.f.format, app.lang.l.formats);
					if ($scope.strValue != s){
						$scope.strValue = s;
					};
					var v = strToNumber($scope.strValue, app.lang.l.formats);
					if (v != $scope.value)
						$scope.value = v;
					$timeout(() => setCaret($scope.input[0], s.length + 1));
				}
			});
			$scope.$watch(scope => scope.value, (newValue, oldValue, scope) => {
				let s;
				if (!isNaN($scope.min)){
					if (newValue < +($scope.min)){
						newValue = +($scope.min);
					}
				}

				if (!isNaN($scope.max)){
					if (newValue > +($scope.max))
						newValue = +($scope.max);
				}

				if (newValue !== oldValue)
					s = formatNumber(newValue + "", $scope.f.format, app.lang.l.formats);
				if (s != $scope.strValue)
					$scope.strValue = s;
			});
		}
	}
}]);