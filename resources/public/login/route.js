'use strict'

module.exports.route = function(){
	return {
		name: 'login',
		path: '/login',
		isPublic: true,

		post: function(req, res){
			if (!req.body || !req.body.username || !req.body.password){
				res.json({ error: 'Invalid username or password.' });
				return
			}

			global.db_conn.get(function(err, db){
				if (err)
					throw err;

				db.query("SELECT Id, UserName, Password FROM Accounts WHERE UserName = ?", [req.body.username], function(err, rows){
					if (!!err)
						res.send(err);
					else if (!rows[0] || !rows[0].USERNAME || rows[0].PASSWORD !== req.body.password)
						res.json({error: 'Invalid username or password.'});
					else
						res.json(token_service.login(rows[0].ID, rows[0].ID));
					db.detach();
				})
			});
		}
	}
}

