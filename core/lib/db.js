"use strict";

class DB {

	constructor(server) {
		this.server = server;
	}

	get(model, conditions, orders, page, listing) {
		return SQLHelper.get(this, model, conditions, orders, page, listing);
	};

	record(model, conditions, orders, page) {
		return SQLHelper.get(this, model, conditions);
	};

	insert(model, dataset) {
		return SQLHelper.insert(this, model, dataset);
	};

	update(model, dataset) {
		return SQLHelper.update(this, model, dataset);
	};

	delete(model, dataset) {
		return SQLHelper.delete(this, model, dataset);
	};

}

module.exports = DB;