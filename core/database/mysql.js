"use strict";

class MySQL extends DB {

	constructor(server) {
		super(server);
		this.engine = require('mysql');
		this.connectionOptions = {
			host: server.config.mysqlHost || 'localhost',
			port: server.config.mysqlPort || '3306',
			user: server.config.mysqlUser || 'root',
			password: server.config.mysqlPass || '',
			database: server.config.mysqlDatabase,
			timezone: 'utc',
			dateStrings: true,
			connectionLimit: server.config.mysqlConnectionLimit,
 			multipleStatements: true
		};

		this.escape = this.engine.escape;
		this.pool = this.engine.createPool(this.connectionOptions);
		this.pool.getConnection((err, conn) => {
			if (!err)
				console.log("MySQL database is connected...");
			else{
				console.log("Error connecting database...");
				throw err;
			}
		});
	};

	async query(sql, params) {
		let pool = this.pool;
		return new Promise((resolve, reject) => {
			pool.getConnection((err, conn) => {
				if (err)
					throw err;
				if (!!params) {
					conn.query(sql, params, (error, result, fields) => {
						conn.release();
						resolve({error: error, rows: result, fields: fields});
					});
				} else {
					conn.query(sql, (error, result, fields) => {
						conn.release();
						resolve({error: error, rows: result, fields: fields});
					});
				}
			});
		});
	}

	getSelectSQL(tableName, alias, joins, fields, where, groupBy, orderBy, page, pageRecords) {
		let pagination = "";
		if (pageRecords === undefined)
			pageRecords = this.server.config.pageRecords;
		if (!!page){
			let limitNumber = (page - 1) * pageRecords;
			if (limitNumber != NaN)
				pagination = " LIMIT " + limitNumber + ", " + pageRecords;
		};
		return "SELECT " + fields + " FROM " + this.escapeTable(tableName, alias) + " " + joins +  " " + where + " "  + groupBy + " " + orderBy + pagination;
	}

	async getAutoInc(systemUser, tableName) {
		let sql = "INSERT INTO " + this.server.config.autoincTable + " (" + this.escapeField(this.server.config.systemUserField) + ", " + this.escapeField(this.server.config.autoincTableField) + ", " + this.escapeField(this.server.config.autoincIdField);
			sql += ") VALUES (" + this.escape(systemUser) + ", " + this.escape(tableName) + ", @id := 1) ON DUPLICATE KEY UPDATE " + this.escapeField(this.server.config.autoincIdField) + " = @id := " + this.escapeField(this.server.config.autoincIdField) + " + 1;";
			sql += "SELECT @id as id;";
		let result = await this.query(sql);
		if (result.error)
			return result;
		return DBUtils.normatizeObject(result.rows[1][0])["id"];
	}

	escapeField(fieldName, alias) {
		if (fieldName !== undefined)
			return (alias ? alias + '.': "") + '`' + fieldName + '`';
	}

	escapeTable(tableName, alias) {
		if (tableName !== undefined)
			return '`' + tableName + '`' + (alias ? " " + alias : "");
	}
}

module.exports = MySQL;