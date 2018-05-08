module.exports.instance = function(){
	this.__proto__ = new recordPrototype();
	this.resource = "products";
	this.alias = "p";
	this.fields = [
		{name: "AccountId",		dataType: "integer", key: true, hidden: true},
		{name: "Id", 			dataType: "integer", key: true, autoInc: true},
		{name: "Name",			dataType: "string"},
		{name: "Description",	dataType: "string"},
		{name: "Price",			dataType: "float"},
		{name: "Stock",			dataType: "float", readOnly: true},
		{name: "Unity", 		dataType: "string", orign: "u.description"}
		{name: "Is_Service", 	dataType: "bool"},
	];

	this.joins = [
		{resource: "unities", alias: "u", condition: "u.id = p.unitid"}
	];

	this.conditions = [

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
