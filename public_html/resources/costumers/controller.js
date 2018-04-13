'use strict'

var app = angular.module('mainApp');
app.register.controller('costumersCtrl', ['$scope',
	function($scope){

		var prepareRecs =

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
			{name: "Id", fieldType: "integer", primaryKey: true, hide: true},
			{name: "Name", displayLabel: "Name", fieldSize: 70, fieldType: "string", sortable: true, searchable: true, required: true},
			{name: "Address", displayLabel: "Address", hide: true, required: true},
			{name: "PhoneNumber", displayLabel: "Phone Number", fieldSize: 15, fieldType: "string", alignment: "center"},
			{name: "Birthday", displayLabel: "Birthday", fieldSize: 15, fieldType: "date", sortable: true, alignment: "center"},
			{name: "Add_Date", displayLabel: "Date", fieldSize: 15, fieldType: "date", sortable: true, alignment: "center"},
			{name: "Add_Time", displayLabel: "Time", fieldSize: 15, fieldType: "time", sortable: true, alignment: "center"},
			{name: "Add_TimeStamp", displayLabel: "TimeStamp", fieldSize: 15, fieldType: "datetime", sortable: true, alignment: "center"},
			{name: "Email", displayLabel: "Email", hide: true},
			{name: "Gender", displayLabel: "Gender", hide: true, fieldType: "options",
				options: [
					{value: "F", text: "Female"},
					{value: "M", text: "Male"}
				]
			},
			{name: "Is_Married", displayLabel: "Married", hide: true, fieldType: "bool"},
		];

		$scope.filters = [
			{name: "Birthday", field: "Birthday", type: "date", showMonth: true, column: 1},
			{name: "Add_Date", field: "Add_Date", type: "date", showMonth: false, column: 2},
			{name: "Gender", field: "Gender", type: "options", column: 3},
			{name: "Is_Married", field: "Is_Married", type: "bool", column: 3},
		];

	}
]);