'use strict';

var app = angular.module('mainApp');
app.directive("uiMessageBox", function(){
	return {
		restrict: "E",
		templateUrl: "app/core/views/uiMessageBox.html",
		replace: true,
		link: function($scope, element, attrs){
			var setButtons = function() {
				var buttons = $scope.messageBoxContent.buttons.toLowerCase().split(';');
				$scope.btnYes = buttons.indexOf('yes') >= 0;
				$scope.btnNo = buttons.indexOf('no') >= 0;
				$scope.btnDelete = buttons.indexOf('delete') >= 0;
				$scope.btnCancel = buttons.indexOf('cancel') >= 0;
				$scope.btnOk = buttons.indexOf('ok') >= 0;
			}

			$scope.$watch(attrs.visible, function(value){
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

			$(element).on('shown.bs.modal', function(){
				$scope.$apply(function(){
					$scope.$parent[attrs.visible] = true;
				});
			});

			$(element).on('hidden.bs.modal', function(){
				$scope.$apply(function(){
					$scope.$parent[attrs.visible] = false;
				});
			});
		}
	}
});
