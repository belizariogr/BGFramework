'use strict';

var app = angular.module('mainApp');
app.directive("uiInputColorPicker", ['colorList', (colorList) => {
	return {
		restrict: "E",
		template: '<div class="edit-row edit-dropdown"><div class="edit-row-label-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label">{{::label}}</label></div><div class="edit-row-input input-colorpicker"><div class="colorline"><div ng-repeat="c in lineColors track by $index" class="circle {{::readOnly ? \'read-only\' : \'\'}}" style="background: #{{c}}; color: {{getContrastColor(c)}}; border: solid {{getBorderColor(c)}}" ng-click="select(c)"><i class="fa fa-check" ng-show="c == value"></i></div><a ng-if="::!readOnly" role="button" class="btn btn-default dropdown-btn" ng-click="btnMoreClick()">{{::btnMore}}</a></div><div class="picker-content dropdown-container"><div class="dropdown-content colorline" ng-repeat="(row, r) in colors track by $index"><div ng-repeat="(col, c) in r track by $index" class="circle" style="background: #{{c}}; color: {{::getContrastColor(col, row)}}; border: solid {{::getBorderColor(c)}}" ng-click="select(c, col, row)"><i class="fa fa-check" ng-show="c == value"></i></div></div></div></div></div>',
		replace: true,
		scope: {
			fieldId: '@',
			fieldName: '@',
			value: '=',
			labelSize: '@',
			readOnly: '@'
		},
		link: ($scope, element, attrs) => {
			$scope.btnMore = app.lang.l.btnMore;
			$scope.labelSize = $scope.labelSize || 3;
			$scope.label = $scope.fieldName;
			$scope.fieldId = $scope.fieldId || ("input_" + $scope.fieldName);
			$scope.f = $scope.$parent.config.findField($scope.fieldName);
			if (!$scope.f) return;
			try{
				$scope.placeholder = app.lang.l["res_" + $scope.$parent.config.path].fields[$scope.f.name] || $scope.f.displayLabel || $scope.f.name;
			}catch(err){
				$scope.placeholder = $scope.f.displayLabel || $scope.f.name;
			};
			$scope.label = $scope.placeholder + ($scope.f.required ? '*' : '');
			$scope.colors = colorList.colors;
			$scope.lineColors = [$scope.colors[1][1], $scope.colors[2][1], $scope.colors[3][1], $scope.colors[4][1]];
			$scope.divContent = $(element).find('.dropdown-container');
			$scope.showPicker = false;
			$scope.btnMoreClick = () => {
				var dropdowns = document.getElementsByClassName("dropdown-container");
			    var i;
			    for (i = 0; i < dropdowns.length; i++) {
			      	if (dropdowns[i].classList.contains('show'))
			        	dropdowns[i].classList.remove('show');
			    }
				$($scope.divContent).toggleClass("show");
			};
			$scope.select = (value, col, row) => {
				if ($scope.readOnly)
					return
				if (col === undefined)
					$scope.lineSelect = true;
				$scope.value = value;
			};

			$scope.setLineColors = (col, row) => {
				if (col === undefined && row === undefined){
					$scope.lineColors = [$scope.colors[1][1], $scope.colors[2][1], $scope.colors[3][1], $scope.colors[4][1]];
					return;
				}

				let startRow = row == 0 ? 0 : (row == 5 ? 2 : 1);
				$scope.lineColors[0] = $scope.colors[startRow][col];
				$scope.lineColors[1] = $scope.colors[startRow + 1][col];
				$scope.lineColors[2] = $scope.colors[startRow + 2][col];
				$scope.lineColors[3] = $scope.colors[startRow + 3][col];
			}

			$scope.getContrastColor = colorList.getContrastColor;
			$scope.getBorderColor = colorList.getBorderColor;


			$scope.$watch(scope => scope.value, (newValue, oldValue) => {
				if ($scope.lineSelect) {
					$scope.lineSelect = false;
					return;
				}
				let idx = colorList.getColorIndex(newValue);
				$scope.setLineColors(idx.col, idx.row);
			});




		}
	}
}]);