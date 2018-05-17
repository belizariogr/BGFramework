module.exports = {
	name: 'dashboard',
	path: '/dashboard',
	/* you can set the route function directly from here (get, post, put, delete),
	   but if you set any route function directly, it'll override all the standard behavior.
	   and will disable the models. */
	get: async function(req, res){
		try{
			var params = {};
			var query;
			if (!!req.query && Object.keys(req.query).length !== 0){
				query = req.query;
				for (var q in query)
					params[q.toLowerCase()] = query[q];
			}
			var AccountId = -1;
			if (!!req.token_obj)
				AccountId = req.token_obj.Account;
			var sql = "SELECT ";
			sql += " (SELECT COUNT(*) FROM Costumers WHERE " + config.account_field + " = " + AccountId + ") costumersCount,";
			sql += " (SELECT COUNT(*) FROM Products WHERE " + config.account_field + " = "  + AccountId + ") productsCount";
			if (config.database_type == "firebird")
				sql += " FROM RDB$DATABASE";
			var result = await db_conn.asyncQuery(sql);
			if (result.error)
				throw result.error;
			res.send(result);
		} catch(err){
			if (config.debug)
				console.log(err);
			res.status(500).send('Cannot GET: ' + err);
		}
	},
}

