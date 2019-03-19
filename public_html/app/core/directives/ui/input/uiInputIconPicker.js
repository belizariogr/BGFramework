'use strict';

var app = angular.module('mainApp');
app.directive("uiInputIconPicker", () => {
	return {
		restrict: "E",
		template: '<div class="edit-row edit-dropdown"><div class="edit-row-label-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label">{{::label}}</label></div><div class="edit-row-input input-iconpicker"><div class="iconline"><div ng-repeat="i in lineIcons track by $index" class="circle {{::readOnly ? \'read-only\' : \'\'}} {{i == icons[value] ? \'selected\' : \'\'}}" ng-click="select(i)"><i class="fa fa-{{i}}"></i></div><a ng-if="::!readOnly" role="button" class="btn btn-default dropdown-btn" ng-click="btnMoreClick()">{{::btnMore}}</a></div><div class="picker-content dropdown-container"><div class="dropdown-content"><div ng-repeat="i in icons track by $index" class="circle {{i == icons[value] ? \'selected\' : \'\'}}" ng-click="select(i, $index)"><i class="fa fa-{{i}}"></i></div></div></div></div></div>',

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
			try {
				$scope.placeholder = app.lang.l["res_" + $scope.$parent.config.path].fields[$scope.f.name] || $scope.f.displayLabel || $scope.f.name;
			} catch (err) {
				$scope.placeholder = $scope.f.displayLabel || $scope.f.name;
			};
			$scope.label = $scope.placeholder + ($scope.f.required ? '*' : '');
			$scope.icons = app.appConfig.icons;
			$scope.lineIcons = [$scope.icons[0], $scope.icons[1], $scope.icons[2], $scope.icons[3]];
			$scope.divContent = $(element).find('.dropdown-container');
			$scope.showPicker = false;
			$scope.btnMoreClick = () => {
				var dropdowns = document.getElementsByClassName("dropdown-container");
				var i;
				for (i = 0; i < dropdowns.length; i++) {
					if (dropdowns[i].classList.contains('show'))
						dropdowns[i].classList.remove('show');
				}
				$($scope.divContent).toggleClass("show")
			};
			$scope.select = (icon, index) => {
				if ($scope.readOnly)
					return
				if (index === undefined)
					$scope.lineSelect = true;
				$scope.value = $scope.icons.indexOf(icon);
			};

			$scope.setLineIcons = (index) => {
				if (index === undefined) {
					$scope.lineIcons = [$scope.icons[0], $scope.icons[1], $scope.icons[2], $scope.icons[3]];
					return;
				}
				let startIdx = index - 1;
				if (startIdx < 0)
					startIdx = 0;
				if (startIdx + 4 >= $scope.icons.length)
					startIdx = $scope.icons.length - 5;
				$scope.lineIcons = [$scope.icons[startIdx], $scope.icons[startIdx + 1], $scope.icons[startIdx + 2], $scope.icons[startIdx + 3]];
			}

			$scope.$watch('value', (newValue, oldValue) => {
				if ($scope.lineSelect) {
					$scope.lineSelect = false;
					return;
				}
				$scope.setLineIcons(newValue);
			});
		}
	}
});