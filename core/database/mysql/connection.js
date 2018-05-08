module.exports.setup = function(config){
	global.listPrototype = require('../../database/list_prototype.js').ListPrototype;
	global.recordPrototype = require('../../database/record_prototype.js').RecordPrototype;
	global.mysql = require('mysql');
	var connection = mysql.createPool({
		host: 				config.mysql_host || 'localhost',
		port: 				config.mysql_port || '3306',
		user: 				config.mysql_user || 'root',
		password: 			config.mysql_pass || '',
		database: 			config.mysql_database,
		connectionLimit: 	config.mysql_connectionLimit,
 		multipleStatements: true
	});

	connection.getConnection(function (err, conn) {
		if (!err)
			console.log("MySQL database is connected...");
		else
			console.log("Error connecting database...");
	});

	connection.query = function(sql, a, b){
		var callback = b || a;
		connection.getConnection(function(err, conn){
			if (err)
				throw err;
			else {
				var ret = function(err, result){
					conn.release();
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

	connection.getSelectSQL = function(tableName, fields, where, groupBy, orderBy, page){
		var pagination = "";
		if (!!page){
			var limitNumber = (page - 1) * global.config.page_records;
			if (limitNumber != NaN)
				pagination = " LIMIT " + limitNumber + ", " + global.config.page_records;
		};
		return "SELECT " + fields + " FROM " + tableName + " " + where + " "  + groupBy + " " + orderBy + pagination;
	};

	connection.getAutoIncId = function(account, tableName, callback){
		var sql = "INSERT INTO " + global.config.autoinc_table + " (" + global.config.account_field + ", " + global.config.autoinc_table_field + ", " + global.config.autoinc_id_field;
			sql += ") VALUES (" + connection.escape(account) + ", " + connection.escape(tableName) + ", @id := 1) ON DUPLICATE KEY UPDATE " + global.config.autoinc_id_field + " = @id := " + global.config.autoinc_id_field + " + 1;";
			sql += "SELECT @id;";
		connection.query(sql, function(err, result){
			callback(err, result[1][0]["@id"])
		});
	};

	return connection;
};