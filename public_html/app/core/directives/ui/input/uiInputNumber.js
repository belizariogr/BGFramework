'use strict';

var app = angular.module('mainApp');
app.directive("uiInputNumber", function(){
	return {
		restrict: "E",
		template: '<div class="edit-row"><div class="col-md-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label">{{::label}}</label></div><div class="edit-row-input col-md-{{::editSize}}"><input class="form-control" ng-model="strValue" type="text" inputmode="numeric" id="{{::fieldId}}" placeholder="{{::placeholder}}" ng-readonly="readOnly"></div></div>',
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
			$scope.input = element.find('.input');
			$scope.f = $scope.$parent.config.findField($scope.field);
			if (!$scope.f) return;
			try{
				$scope.placeholder = app.lang.l["res_" + $scope.$parent.config.path].fields[$scope.f.name] || $scope.f.displayLabel || $scope.f.name;
			}catch(err){
				$scope.placeholder = $scope.f.displayLabel || $scope.f.name;
			};

			var setCaretPosition = function(elem, caretPos) {
				if (elem !== null)
					return;
				if (elem.createTextRange) {
					var range = elem.createTextRange();
					range.move('character', caretPos);
					range.select();
				} else {
					if (elem.setSelectionRange) {
						elem.focus();
						elem.setSelectionRange(caretPos, caretPos);
					} else
						elem.focus();
				}
			};

			$scope.format = $scope.f.format || '';
			$scope.label = $scope.placeholder + ($scope.f.required ? '*' : '');
			$scope.$watch(function(scope){return scope.strValue}, function(newValue, oldValue){
				if (newValue != oldValue){
					var s = formatNumber(newValue + "a", $scope.f.format, app.lang.l.formats);
					if ($scope.strValue != s){
						$scope.strValue = s;
						setCaretPosition($scope.input, s.length + 1);
					};
					var v = strToNumber($scope.strValue, app.lang.l.formats);
					if (v != $scope.value)
						$scope.value = v;
				}
			});
			$scope.$watch(function(scope){return scope.value}, function(newValue, oldValue){
				if (newValue != oldValue)
					var s = formatNumber(newValue + "", $scope.f.format, app.lang.l.formats);
					if (s != $scope.strValue)
						$scope.strValue = s;
			});
		}
	}
});