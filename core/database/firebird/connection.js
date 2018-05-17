module.exports.setup = function(config){
	global.modelPrototype = require('../../database/model_prototype.js');
	global.firebird = require('node-firebird');
	var conn_options = {
		host: config.fb_host || 'localhost',
		port: config.fb_port || '3050',
		user: config.fb_user || 'SYSDBA',
		password: config.fb_pass || 'masterkey',
		database: config.fb_database
	};

	var connection = firebird.pool(config.fb_connectionLimit, conn_options);
	connection.sqlHelper = require('../sqlhelper.js');
	connection.escape = firebird.escape;

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
			var limitNumber = (page - 1) * config.page_records;
			if (limitNumber != NaN)
				pagination = "FIRST " + config.page_records + " SKIP " + limitNumber;
		}
		return "SELECT " + pagination + " " + fields + " FROM " + tableName + " " + where + " "  + groupBy + " " + orderBy;
	};

	connection.getAutoInc = async function(account, tableName){
		var sql = "EXECUTE BLOCK RETURNS (ID INTEGER) AS BEGIN " +
					" UPDATE OR INSERT INTO " + config.autoinc_table + " (" + config.account_field + ", " + config.autoinc_table_field + ", " +
					config.autoinc_id_field + ") " + " VALUES (" + account + ", '" + tableName.toUpperCase() + "', COALESCE((SELECT MAX(" + config.autoinc_id_field +
					") + 1 FROM " + config.autoinc_table + " WHERE " +  config.account_field + " = " + account + " AND " + config.autoinc_table_field +
					" = '" + tableName.toUpperCase() + "'), 1)) " +	" MATCHING(" + config.account_field + ", " + config.autoinc_table_field + ") RETURNING " +
					config.autoinc_id_field + " INTO :ID; SUSPEND; END";
		var result = await connection.asyncQuery(sql);
		if (result.error)
			return result;
		return dbutils.normatizeObject(result.rows[0])["id"];
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