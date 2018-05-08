module.exports.setup = function(config){
	global.listPrototype = require('../../database/list_prototype.js').ListPrototype;
	global.recordPrototype = require('../../database/record_prototype.js').RecordPrototype;
	global.firebird = require('node-firebird');
	var conn_options = {
		host: config.fb_host || 'localhost',
		port: config.fb_port || '3050',
		user: config.fb_user || 'SYSDBA',
		password: config.fb_pass || 'masterkey',
		database: config.fb_database
	};

	var connection = firebird.pool(config.fb_connectionLimit, conn_options);
	connection.get(function (err, conn) {
		if (!err){
			console.log("Firebird database is connected...");
			conn.detach();
		} else {
			console.log("Error connecting database...");
			throw err;
		}
	});

	connection.query = function(sql, a, b){
		var callback = b || a;
		connection.get(function(err, conn){
			if (err)
				throw err;
			else {
				var ret = function(err, result){
					conn.detach();
					if (!!callback)
						callback(err, result);
				};
				if (!!b)
					conn.query(sql, a, ret);
				else
					conn.query(sql, ret);
			}
		})
	};

	connection.syncQuery = function(sql){
		return sync.await(connection.query(sql, sync.defer()));
	};

	connection.escape = function(str) {
		return firebird.escape(str);
	};

	connection.getSelectSQL = function(tableName, select, where, groupBy, orderBy, page){
		var pagination = "";
		if (!!page){
			var limitNumber = (page - 1) * config.page_records;
			if (limitNumber != NaN)
				pagination = "FIRST " + config.page_records + " SKIP " + limitNumber;
		}
		return "SELECT " + pagination + " " + select + " FROM " + tableName + " " + where + " "  + groupBy + " " + orderBy;
	};

	connection.getAutoIncId = function(account, tableName, callback){
		var sql = "EXECUTE BLOCK RETURNS (ID INTEGER) AS BEGIN " +
						" UPDATE OR INSERT INTO " + config.autoinc_table + " (" + config.account_field + ", " + config.autoinc_table_field + ", " +
						config.autoinc_id_field + ") " + " VALUES (" + account + ", '" + tableName.toUpperCase() + "', COALESCE((SELECT MAX(" + config.autoinc_id_field +
						") + 1 FROM " + config.autoinc_table + " WHERE " +  config.account_field + " = " + account + " AND " + config.autoinc_table_field +
						" = '" + tableName.toUpperCase() + "'), 1)) " +	" MATCHING(" + config.account_field + ", " + config.autoinc_table_field + ") RETURNING " +
						config.autoinc_id_field + " INTO :ID; SUSPEND; END";
		connection.query(sql, function(err, rows, fields){
			callback(err, utils.getPropValue(rows[0], config.autoinc_id_field))
		});
	};
	return connection;
};