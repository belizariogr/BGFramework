"use strict";

class DashboardController extends Controller {

	constructor() {
		super('dashboard' ,'/dashboard');
    }

    /* you can set the route function directly from here (get, post, put, delete),
	   but if you set any route function directly, it'll override all the standard behavior.
	   and will disable the models. */
   async get(req, res) {
		try{
			var params = {};
			var query;
			if (!!req.query && Object.keys(req.query).length !== 0){
				query = req.query;
				for (var q in query)
					params[q.toLowerCase()] = query[q];
			}
			var UserId = -1;
			if (!!req.token_obj)
				UserId = req.token_obj.Id;
			var sql = "SELECT ";
			sql += " (SELECT COUNT(*) FROM Costumers WHERE " + req.server.config.systemUserField + " = " + UserId + ") costumersCount,";
			sql += " (SELECT COUNT(*) FROM Products WHERE " + req.server.config.systemUserField + " = "  + UserId + ") productsCount";
			if (req.server.config.databaseType == "firebird")
				sql += " FROM RDB$DATABASE";
			var result = await req.server.db.query(sql);
			if (result.error)
				throw result.error;
			res.send(result);
		} catch(err){
			if (req.server.config.debug)
				console.log(err);
			res.status(500).send('Cannot GET: ' + err);
		}
	}

}

module.exports = DashboardController;
