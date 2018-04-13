'use strict'

module.exports.mysql_config = function(config){

	throw 'Not implemented.';

	/* var mysql = require('mysql');

	var connection = mysql.createPool({
		connectionLimit: config.mysql_connectionLimit || 25,
		host: config.mysql_host || 'localhost',
		port: config.mysql_port || '3306',
		user: config.mysql_user,
		password: config.mysql_pass,
		database: config.mysql_database,
		multipleStatements: true
	});

	//TEST CONNECTION
	connection.getConnection(function (err, conn) {
		if (!err) {
			console.log("Database is connected ... ");
			conn.release();
		} else {
			console.log("Error connecting database ... ");
		}
	});

	connection.syncQuery = function(sql, params){
		return sync.await(connection.query(sql, params, sync.defer()));
	}

	connection.transaction = function(execute, finalize){
		connection.getConnection(function(err, conn){
			if (err)
				return finalize(err);
			execute(conn, function(err){
				if (err) {
					return conn.rollback(function(){
						finalize(err);
					});
				}
				conn.commit(function(err){
					if (err){
						return conn.rollback(function(){
							finalize(err)
						});
					}
					finalize();
				});
			});
		});
	}

	return connection; */
};