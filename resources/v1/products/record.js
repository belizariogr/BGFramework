'use strict'

module.exports.instance = function(){
	this.__proto__ = new recordPrototype();
	this.resource = "products";
	this.fields = [
		{name: "UserId", 		dataType: "integer"},
		{name: "Id", 			dataType: "integer", isKey: true, inWhere: true},
		{name: "Name",			dataType: "string"},
		{name: "Description",	dataType: "string"},
		{name: "Price",			dataType: "float"},
		{name: "Stock",			dataType: "float", readOnly: true}
	];

	this.validateRecord = function(rec){
		if (!rec.Name)
			error(1, "Field \"Name\" is required.");
	}

	this.beforeInsert = function(rec, callback){
		callback();
	}

	this.afterInsert = function(rec, callback){
		callback();
	}

	this.beforeUpdate = function(rec, callback){
		callback();
	}

	this.afterUpdate = function(rec, callback){
		callback();
	}

	this.beforeDelete = function(rec, callback){
		callback();
	}

	this.afterDelete = function(rec, callback){
		callback();
	}
}
