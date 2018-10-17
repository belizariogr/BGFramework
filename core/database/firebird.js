"use strict";

class Firebird extends DB {

	constructor(server) {
		super(server);
		this.engine = require('node-firebird');
		this.connectionOptions = {
			host: server.config.fbHost || 'localhost',
			port: server.config.fbPort || '3050',
			user: server.config.fbUser || 'SYSDBA',
			password: server.config.fbPass || 'masterkey',
			database: server.config.fbDatabase
		};

		this.pool = this.engine.pool(this.server.config.fbConnectionLimit, this.connectionOptions);
		this.pool.get((err, conn) => {
			if (!err){
				console.log("Firebird database is connected...");
				conn.detach();
			} else {
				console.log("Error connecting database...");
				throw err;
			}
		});
		this.escape = this.engine.escape;
	}

	async query(sql, params) {		
		let pool = this.pool;
		return new Promise((resolve, reject) => {
			pool.get((err, conn) => {
				if (err)
					throw err;
				if (!!params) {
					conn.query(sql, params, (error, result, fields) => {
						conn.detach();
						resolve({error: error, rows: result, fields: fields});
					});
				} else {
					conn.query(sql, (error, result, fields) => {
						conn.detach();
						resolve({error: error, rows: result, fields: fields});
					});
				}
			});
		});
	}

	getSelectSQL(tableName, fields, where, groupBy, orderBy, page) {
		let pagination = "";
		if (!!page){1
			let limitNumber = (page - 1) * this.server.config.pageRecords;
			if (limitNumber != NaN)
				pagination = "FIRST " + this.server.config.pageRecords + " SKIP " + limitNumber;
		}
		return "SELECT " + pagination + " " + fields + " FROM " + tableName + " " + where + " "  + groupBy + " " + orderBy;
	}

	async getAutoInc(account, tableName) {		
		let sql = "EXECUTE BLOCK RETURNS (ID INTEGER) AS BEGIN " +
					" UPDATE OR INSERT INTO " + this.server.config.autoincTable + " (" + this.server.config.accountField + ", " + this.server.config.autoincTableField + ", " +
					this.server.config.autoincIdField + ") " + " VALUES (" + account + ", '" + tableName.toUpperCase() + "', COALESCE((SELECT MAX(" + this.server.config.autoincIdField +
					") + 1 FROM " + this.server.config.autoincTable + " WHERE " +  this.server.config.accountField + " = " + account + " AND " + this.server.config.autoincTableField +
					" = '" + tableName.toUpperCase() + "'), 1)) " +	" MATCHING(" + this.server.config.accountField + ", " + this.server.config.autoincTableField + ") RETURNING " +
					this.server.config.autoincIdField + " INTO :ID; SUSPEND; END";
		let result = await this.query(sql);
		if (result.error)
			return result;
		return DBUtils.normatizeObject(result.rows[0])["id"];
	}

}

module.exports = Firebird;