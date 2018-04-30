'use strict';

var app = angular.module('mainApp');
app.directive("uiEditModal", function(){
	return {
		restrict: "E",
		templateUrl: "app/core/views/uiEditModal.html",
		replace: true,
		link: function($scope, element, attrs){
			$scope.modal = $(element).modal({backdrop: 'static', keyboard: true, show: false});
			$scope.editPath = 'resources/' + $scope.config.path + '/edit.html';
			$scope.$watch('showEditModal', function(value){
				if(value === "open")
					$scope.modal.modal('show');
				else if (value === "close")
					$scope.modal.modal("hide");
			});

			$(element).on('hidden.bs.modal', function(){
				$scope.$apply(function(){
					$scope.showEditModal = 'close';
				});
			});
		}
	}
});
