'use strict'

var app = angular.module('mainApp');
app.register.controller('dashboardCtrl', ['$scope', function($scope){
		var resetData = function(){
			$scope.costumersCount = null;
			$scope.productsCount = null;
		}();

		app.restAPI.get('dashboard', false).then(
			function(res){
				if (!!res.data){
					$scope.costumersCount = res.data[0].costumersCount || res.data[0].COSTUMERSCOUNT || 0;
					$scope.productsCount = res.data[0].productsCount || res.data[0].PRODUCTSCOUNT || 0;
				} else {
					resetData();
				}
			},
			function(res){
				resetData();
			}
		);
	}
]);