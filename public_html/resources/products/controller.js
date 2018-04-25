'use strict'

var app = angular.module('mainApp');
app.register.controller('productsCtrl', ['$scope', function($scope){

		$scope.config = {
			path: "products",
			showRefresh: false,
			listResource: "products",
			editResource: "products",
			pagination: true,
			publicResource: false,
			editStyle: "modal",
			useCustomCSS: true,

			getSearch: function(searchText){
				return "name=" + searchText;
			}
		};

		$scope.fields = [
			{name: "Id", 			dataType: "integer", primaryKey: true, hide: true},
			{name: "Name", 			dataType: "string", displayLabel: "Name", fieldSize: 85, sortable: true, searchable: true, required: true},
			{name: "Description", 	dataType: "string", displayLabel: "Description", hide: true},
			{name: "Price", 		dataType: "float", displayLabel: "Price", fieldSize: 15, alignment: "right", format: ",0.00"},
			{name: "Is_Service", 	dataType: "bool", displayLabel: "Service"},
		];

	}
]);
