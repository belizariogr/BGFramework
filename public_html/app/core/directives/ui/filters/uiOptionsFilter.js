'use strict';

var app = angular.module('mainApp');
app.directive("uiOptionsFilter", [() => {
	return {
		restrict: "E",
		template: '<div class="filter col-md-{{filter.columnSize || 12}}"> <div class=row> <div class="caption col-md-12">{{::displayLabel}}</div> </div> <form class="optform"> <div class=row> <div class="col-md-12 checkbox" ng-repeat="item in filter.options track by $index"> <label><input type=checkbox ng-model=item.selected ng-true-value=true> {{::item.text}}</label> </div> </div> </form> </div>',
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
			$scope.filter.options = angular.copy(f.options);
			$scope.filter.options.forEach(i => {
				try {
					i.text = app.lang.l["res_" + $scope.$parent.$parent.config.path].options[f.name][i.value] || i.text;
				}catch(err){}
			});

			$scope.filter.execFilter = () => {
				var allFalse = true;
				$scope.filter.value = '';
				$scope.filter.options.forEach(i => {
					if (i.selected){
						$scope.filter.value += ($scope.filter.value ? '|' : '') + i.value;
						allFalse = false;
					}
				});

				if (allFalse){
					if ($scope.filter.used){
						$scope.filter.used = false;
						$scope.filter.filter();
					}
					return;
				}
				$scope.filter.used = true;
			}

			$scope.filter.clearFilter = () => {
				$scope.filter.used = false;
				$scope.filter.options.forEach(i => i.selected = false);
			}

			if ($scope.filter.used && $scope.filter.value) {
				var values = $scope.filter.value.split('|');
				$scope.filter.options.forEach(i => values.forEach(v => { if (v == i.value) i.selected = true; }));
			}
			else
				$scope.filter.clearFilter();
		}
	}
}]);