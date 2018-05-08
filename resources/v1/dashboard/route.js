module.exports.route = function(){
	return {
		name: 'dashboard',
		path: '/dashboard',
		list: function(req, res){
			try{
				var params = {};
				var query;
				if (!!req.query && Object.keys(req.query).length !== 0){
					query = req.query;
					for (var q in query){
						params[q.toLowerCase()] = query[q];
					}
				}
				var AccountId = -1;
				if (!!req.token_obj)
					AccountId = req.token_obj.Account;

				var sql = "SELECT ";
				sql += " (SELECT COUNT(*) FROM Costumers WHERE AccountId = " + AccountId + ") costumersCount,";
				sql += " (SELECT COUNT(*) FROM Products WHERE AccountId = "  + AccountId + ") productsCount";
				if (global.config.database_type == "firebird")
					sql += " FROM RDB$DATABASE";

				global.db_conn.query(sql, function(error, result, fields){
					if (!!error) {
						console.log('' + error);
						res.status(500).send('Cannot GET.');
					} else
						res.send(result);
				});

			} catch(err){
				console.log(err);
				res.status(500).send('Cannot GET: ' + err);
			}
		},
	}
}

