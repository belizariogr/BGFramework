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
			{name: "Id", fieldType: "integer", primaryKey: true, hide: true},
			{name: "Name", displayLabel: "Name", fieldSize: 85, fieldType: "string", sortable: true, searchable: true, required: true},
			{name: "Description", displayLabel: "Description", hide: true},
			{name: "Price", displayLabel: "Price", fieldSize: 15, fieldType: "float", alignment: "right", format: ",0.00"},
			{name: "Is_Service", displayLabel: "Service", fieldType: "bool"},
		];

	}
]);
