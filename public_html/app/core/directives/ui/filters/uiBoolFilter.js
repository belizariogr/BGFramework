'use strict';

var app = angular.module('mainApp');
app.directive("uiBoolFilter", [() => {
	return {
		restrict: "E",
		template: '<div class="filter col-md-{{filter.columnSize || 12}}"><div class=row><div class="caption col-md-12">{{::displayLabel}}</div></div><form><div class=row><div class="col-md-12 checkbox"><label><input type=checkbox ng-model=trueSelected> {{::trueText}}</label><br><label><input type=checkbox ng-model=falseSelected > {{::falseText}}</label></div></div></form></div>',
		replace: true,
		scope: {
			filter: '='
		},
		link: ($scope, element, attrs) => {
			var f = $scope.$parent.$parent.config.findField($scope.filter.field);
			try{
				$scope.displayLabel = app.lang.l["res_" + $scope.$parent.$parent.config.path].fields[f.name] || f.displayLabel || f.name;
			}catch(err){
				try{
					$scope.displayLabel = f.displayLabel || f.name;
				}catch(err){
					$scope.displayLabel = f.name;
				}
			}
			try {$scope.trueText = app.lang.l.formats.trueText || 'True';} catch(e) {$scope.trueText = 'True';}
			try {$scope.falseText = app.lang.l.formats.falseText || 'False';} catch(e) {$scope.falseText = 'False';}
			$scope.trueSelected = false;
			$scope.falseSelected = false;

			$scope.filter.execFilter = () => {
				$scope.filter.value = '';
				if ($scope.trueSelected)
					$scope.filter.value = $scope.filter.trueValue || 'T';
				if ($scope.falseSelected)
					$scope.filter.value += ($scope.filter.value ? '|' : '') + ($scope.filter.falseValue || 'F');
				$scope.filter.used = true;
			}

			$scope.filter.clearFilter = () => {
				$scope.filter.used = false;
				$scope.trueSelected = false;
				$scope.falseSelected = false;
			}

			if ($scope.filter.used && $scope.filter.value){
				var values = $scope.filter.value.split('|');
				if (values){
					values.forEach(v => {
						if (v == 'T')
							$scope.trueSelected = true;
						if (v == 'F')
							$scope.falseSelected = true;
					});
				}
			}
			else
				$scope.filter.clearFilter();
		}
	}
}]);