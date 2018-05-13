module.exports = {
	resource: "products",
	alias: "p",
	fields: [
		{name: "AccountId",		dataType: "integer", key: true, hidden: true},
		{name: "Id", 			dataType: "integer", key: true, autoInc: true, searchable: true},
		{name: "Name",			dataType: "string", searchable: true, contains: true},
		{name: "Description",	dataType: "string", searchable: true, contains: true},
		{name: "Price",			dataType: "float", searchable: true},
		{name: "Stock",			dataType: "float", readOnly: true},		
		{name: "Is_Service", 	dataType: "bool", searchable: true},
	],

	joins: [],
	conditions: [],

	validateRecord: function(rec){
		if (!rec.Name)
			error(1, "Field \"Name\" is required.");
	},

	beforeInsert: function(rec, callback){
		callback();
	},

	afterInsert: function(rec, callback){
		callback();
	},

	beforeUpdate: function(rec, callback){
		callback();
	},

	afterUpdate: function(rec, callback){
		callback();
	},

	beforeDelete: function(rec, callback){
		callback();
	},

	afterDelete: function(rec, callback){
		callback();
	},
}
