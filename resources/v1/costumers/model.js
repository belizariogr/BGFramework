"use strict";

class CostumersModel extends Model {

	constructor(server) {
		super(server);
		this.resource = 'costumers';
		this.fields = [
			{name: "Id",			dataType: "integer", 	key: true, searchable: true, autoInc: true},
			{name: "Name", 			dataType: "string",		searchable: true, contains: true},
			{name: "Address", 		dataType: "string",		list: false},
			{name: "PhoneNumber", 	dataType: "string" },
			{name: "Email", 		dataType: "string",		list: false},
			{name: "Birthday", 		dataType: "date",		searchable: true},
			{name: "Add_Date", 		dataType: "date",		searchable: true},
			{name: "Add_Time", 		dataType: "time",		searchable: true},
			{name: "Add_TimeStamp", dataType: "datetime",	searchable: true},
			{name: "Gender", 		dataType: "string", 	default: "F", options: true},
			{name: "Is_Married",	dataType: "bool",		default: false, searchable: true},
		];
	}

}

module.exports = CostumersModel;