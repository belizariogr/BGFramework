"use strict";

class MongoDB extends DB {

	constructor(server) {
		throw 'Not implemented.';
	}

	get(model, conditions, orders, page, listing) {
		
	};

	record(model, conditions, orders, page) {
		
	};

	insert(model, dataset) {
		
	};

	update(model, dataset) {
		
	};

	delete(model, dataset) {
		
	};

	formatDateTime(datetime) {
		return datetime.getFullYear() + "-" + Utils.twoDigits(datetime.getMonth() + 1) + "-" + Utils.twoDigits(datetime.getDate()) + " " + Utils.twoDigits(datetime.getHours()) + ":" + Utils.twoDigits(datetime.getMinutes()) + ":" + Utils.twoDigits(datetime.getSeconds());
	}

	async query(sql, params) {		
		
	}

	async getAutoInc(systemUser, tableName) {
		
	}
	
	escapeField(fieldName) {
		
	}
}

module.exports = MongoDB;