module.exports.instance = function(){
	this.__proto__ = new listPrototype();
	this.resource = "products";
	this.fields = [
		{name: "Id", 				dataType: "integer", key: true, searchable: true},
		{name: "Name", 				dataType: "string", searchable: true, contains: true},
		{name: "Description", 		dataType: "string", searchable: true},
		{name: "Price", 			dataType: "float", searchable: true},
		{name: "Stock", 			dataType: "float"},
		{name: "Is_Service", 		dataType: "bool", searchable: true},
	];
}
