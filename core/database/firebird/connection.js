'use strict'

module.exports.setup = function(config){

	global.firebird = require('node-firebird');
	var conn_options = {
		host: config.fb_host || 'localhost',
		port: config.fb_port || '3050',
		user: config.fb_user || 'SYSDBA',
		password: config.fb_pass || 'masterkey',
		database: config.fb_database
	}

	var connection = firebird.pool(config.fb_connectionLimit, conn_options);

	//TEST CONNECTION
	connection.get(function (err, conn) {
		if (!err){
			console.log("Database is connected...");
			conn.detach();
		}
		else {
			console.log("Error connecting database...");
			throw err;
		}
	});

	connection.query = function(sql, callback){
		connection.get(function(err, db){
			if (err)
				callback(err)
			else
				db.query(sql, function(err, result){
					callback(err, result);
					db.detach();
				});
		})
	}

	connection.syncQuery = function(sql, params){
		return sync.await(connection.query(sql, params, sync.defer()));
	}

	return connection;
};