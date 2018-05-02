'use strict';

var app = angular.module('mainApp');
app.register.controller('costumersCtrl', ['$scope',	function($scope){
		$scope.config = {
			path: "costumers",
			showRefresh: false,
			api: app.restAPI,
			listResource: "costumers",
			editResource: "costumers",
			pagination: true,
			publicResource: false,
			afterLoad: function(dataset, scope){

			},
			getSearch: function(searchText){
				return "name=" + searchText;
			},
			onPrepareRecord: function(rec, scope, operation){
				if (rec.PhoneNumber)
					rec.PhoneNumber = formatPhone(rec.PhoneNumber);
			},
			validateRecord: function(record){

			}
		};

		$scope.fields = [
			{name: "Id", 			dataType: "integer", primaryKey: true, hide: true},
			{name: "Name", 			dataType: "string", displayLabel: "Name", fieldSize: 70, sortable: true, searchable: true, required: true},
			{name: "Address", 		dataType: "string", displayLabel: "Address", hide: true, required: true},
			{name: "PhoneNumber", 	dataType: "string", displayLabel: "Phone Number", fieldSize: 15, alignment: "center"},
			{name: "Birthday", 		dataType: "date", displayLabel: "Birthday", fieldSize: 15, sortable: true, alignment: "center"},
			{name: "Add_Date", 		dataType: "date", displayLabel: "Date", fieldSize: 15, sortable: true, alignment: "center"},
			{name: "Add_Time", 		dataType: "time", displayLabel: "Time", fieldSize: 15, sortable: true, alignment: "center"},
			{name: "Add_TimeStamp", dataType: "datetime", displayLabel: "TimeStamp", fieldSize: 15, sortable: true, alignment: "center"},
			{name: "Email", 		dataType: "string", displayLabel: "Email", hide: true},
			{name: "Gender", 		dataType: "options", displayLabel: "Gender", hide: true,
				options: [
					{value: "F", text: "Female"},
					{value: "M", text: "Male"}
				]
			},
			{name: "Is_Married", 	dataType: "bool", displayLabel: "Married", hide: true},
		];

		$scope.filters = [
			{name: "Birthday", field: "Birthday", type: "date", showMonth: true, column: 1},
			{name: "Add_Date", field: "Add_Date", type: "date", showMonth: false, column: 2},
			{name: "Gender", field: "Gender", type: "options", column: 3},
			{name: "Is_Married", field: "Is_Married", type: "bool", column: 3},
		];

	}
]);