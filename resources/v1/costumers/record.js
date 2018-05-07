'use strict'

module.exports.instance = function(){
	this.__proto__ = new recordPrototype();
	this.resource = "costumers";
	this.fields = [
		{name: "Id",			dataType: "integer", isKey: true},
		{name: "Name", 			dataType: "string"},
		{name: "Address", 		dataType: "string"},
		{name: "PhoneNumber", 	dataType: "string"},
		{name: "Email", 		dataType: "string"},
		{name: "Birthday", 		dataType: "date"},
		{name: "Add_Date", 		dataType: "date"},
		{name: "Add_Time", 		dataType: "time"},
		{name: "Add_TimeStamp", dataType: "datetime"},
		{name: "Gender", 		dataType: "string", isOptions: true},
		{name: "Is_Married",	dataType: "bool"},
	];
}
