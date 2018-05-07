'use strict'

module.exports.instance = function(){
	this.__proto__ = new listPrototype();
	this.resource = "costumers";
	this.fields = [
		{name: "Id", 			dataType: "integer", isKey: true, searchable: true},
		{name: "Name", 			dataType: "string", searchable: true, contains: true},
		{name: "PhoneNumber",	dataType: "string"},
		{name: "Birthday", 		dataType: "date", searchable: true},
		{name: "Add_Date", 		dataType: "date", searchable: true},
		{name: "Add_Time", 		dataType: "time", searchable: true},
		{name: "Add_TimeStamp",	dataType: "datetime", searchable: true},
		{name: "Gender", 		dataType: "string", searchable: true, isOptions: true},
		{name: "Is_Married", 	dataType: "bool", searchable: true, isOptions: true},
	];
}
