module.exports = {
	resource: "costumers",
	fields: [
		{name: "Id",			dataType: "integer", 	list: true, key: true, searchable: true, autoInc: true},
		{name: "Name", 			dataType: "string",		list: true, searchable: true, contains: true},
		{name: "Address", 		dataType: "string",		list: false},
		{name: "PhoneNumber", 	dataType: "string",		list: true},
		{name: "Email", 		dataType: "string",		list: false},
		{name: "Birthday", 		dataType: "date",		list: true, searchable: true},
		{name: "Add_Date", 		dataType: "date",		list: true, searchable: true},
		{name: "Add_Time", 		dataType: "time",		list: true, searchable: true},
		{name: "Add_TimeStamp", dataType: "datetime",	list: true, searchable: true},
		{name: "Gender", 		dataType: "string", 	list: true, default: "F", options: true},
		{name: "Is_Married",	dataType: "bool",		list: true, default: false, searchable: true},
	]
}
