module.exports.setup = function(config){
	global.modelPrototype = require('../../database/model_prototype.js');
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

	connection.sqlHelper = require('../sqlhelper.js');
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

	connection.asyncQuery = function(sql, params){
		return new Promise(function(resolve, reject){
			if (!!params)
				connection.query(sql, params, function(error, result, fields){
					resolve({error: error, rows: result, fields: fields})
				});
			else
				connection.query(sql, function(error, result, fields){
					resolve({error: error, rows: result, fields: fields});
				});
		})
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

	connection.getAutoInc = async function(account, tableName){
		var sql = "INSERT INTO " + global.config.autoinc_table + " (" + global.config.account_field + ", " + global.config.autoinc_table_field + ", " + global.config.autoinc_id_field;
			sql += ") VALUES (" + connection.escape(account) + ", " + connection.escape(tableName) + ", @id := 1) ON DUPLICATE KEY UPDATE " + global.config.autoinc_id_field + " = @id := " + global.config.autoinc_id_field + " + 1;";
			sql += "SELECT @id as id;";
		var result = await connection.asyncQuery(sql);
		if (result.error)
			return result;
		return dbutils.normatizeObject(result.rows[1][0])["id"];
	};

	connection.list = function(model, conditions, orders, page){
		return connection.sqlHelper.get(connection, model, conditions, orders, page);
	};

	connection.record = function(model, conditions){
		return connection.sqlHelper.get(connection, model, conditions);
	};

	connection.insert = function(model, dataset){
		return connection.sqlHelper.insert(connection, model, dataset);
	};

	connection.update = function(model, dataset){
		return connection.sqlHelper.update(connection, model, dataset);
	};

	connection.delete = function(model, dataset){
		return connection.sqlHelper.delete(connection, model, dataset);
	};

	return connection;
};