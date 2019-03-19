'use strict';

var app = angular.module('mainApp');
app.directive("uiMessageBox", () => {
	return {
		restrict: "E",
		templateUrl: "app/core/views/uiMessageBox.html",
		replace: true,
		link: ($scope, element, attrs) => {
			var setButtons = () => {
				var buttons = $scope.messageBoxContent.buttons.toLowerCase().split(';');
				$scope.btnYes = buttons.indexOf('yes') >= 0;
				$scope.btnNo = buttons.indexOf('no') >= 0;
				$scope.btnDelete = buttons.indexOf('delete') >= 0;
				$scope.btnCancel = buttons.indexOf('cancel') >= 0;
				$scope.btnOk = buttons.indexOf('ok') >= 0;
			}

			$scope.$watch(attrs.visible, value => {
				if(!!value) {
					if (!!$scope.messageBoxContent){
						setButtons();
						if (!!$scope.messageBoxContent.modal)
							$(element).modal({backdrop: 'static'});
						else
							$(element).modal();
					}
				}
			});

			$(element).on('shown.bs.modal', () => $scope.$apply(() => $scope.$parent[attrs.visible] = true));
			$(element).on('hidden.bs.modal', () => $scope.$apply(() => $scope.$parent[attrs.visible] = false));
		}
	}
});
