"use strict";

class Products extends Model {

	constructor(server) {
		super(server);
		this.resource = 'products';
		this.alias = 'p';
		this.fields = [
			{name: "Id", 			dataType: "integer", key: true, autoInc: true, searchable: true},
			{name: "Name",			dataType: "string", searchable: true, contains: true},
			{name: "Description",	dataType: "string", searchable: true, contains: true},
			{name: "Price",			dataType: "float", searchable: true},
			{name: "Stock",			dataType: "float", readOnly: true},
			{name: "Is_Service", 	dataType: "bool", searchable: true},
		];
		this.joins = [];
		this.conditions = [];
	}

}

module.exports = Products;