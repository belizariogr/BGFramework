'use strict';

var app = angular.module('mainApp');
app.directive("uiEditModal", ['screenSize', (screenSize) => {
	return {
		restrict: "E",
		templateUrl: "app/core/views/uiEditModal.html",
		replace: true,
		link: ($scope, element, attrs) => {
			$scope.modal = $(element).modal({backdrop: 'static', keyboard: true, show: false});
			$scope.editPath = 'resources/' + $scope.config.path + '/edit.html';
			$scope.$watch('showEditModal', value => {
				if(value === "open")
					$scope.modal.modal('show');
				else if (value === "close")
					$scope.modal.modal("hide");
			});

			$(element).on('hidden.bs.modal', () => $scope.$apply(() => $scope.showEditModal = 'close'));

			if (!screenSize.is('xs, sm')) {
				$(element).on('shown.bs.modal', () => {
					if ($scope.dataLoading)
						return;
					let inputs = $(element).find("input");
					if (!!inputs && inputs.length > 0)
						$(inputs[0]).focus();
				})
			}
		}
	}
}]);
