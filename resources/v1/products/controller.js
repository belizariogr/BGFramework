module.exports = {
	name: 'products',
	path: '/products',
	list: true,
	record: true,
	insert: true,
	update: true,
	delete: true,

	validateRecord: function(rec){
		if (!rec.Name)
			error(1, "Field \"Name\" is required.");
	},
}

