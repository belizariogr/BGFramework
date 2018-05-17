module.exports = {
	name: 'login',
	path: '/login',
	isPublic: true,
	post: async function(req, res){
		if (!req.body || !req.body.username || !req.body.password)
			return res.json({ error: 'Invalid username or password.' });
		try {
			var rec = dbutils.normatizeObject(req.body);
			var sql = "SELECT " + config.account_id_field + ", " + config.account_username + ", " + config.account_password + " FROM " + config.account_table + " WHERE " + config.account_username + " = ?";
			result = await db_conn.asyncQuery(sql, [rec.username]);
			if (!!result.err)
				throw result.err;
			if (result.rows.length == 0)
				return res.json({error: 'Invalid username or password.'});
			var id, username, password;
			if (!!result.rows[0]) {
				id = utils.getPropValue(result.rows[0], config.account_id_field);
				username = utils.getPropValue(result.rows[0], config.account_username);
				password = utils.getPropValue(result.rows[0], config.account_password);
			};
			if (!username)
				return res.json({error: 'Invalid username or password.'});
			if (config.encrypt_password) {
				bcrypt.compare(rec.username + '||'+ rec.password, password, function(err, valid) {
				    if (valid)
				    	res.json(token_service.login(id, id));
				    else
				    	res.json({error: 'Invalid username or password.'});
				});
			} else {
				if (password === rec.password)
					res.json(token_service.login(id, id));
				else
					res.json({error: 'Invalid username or password.'});
			}
		} catch(err) {
			if (config.debug)
				console.log(err)
			res.json({error: "Error on login."});
		}
	}
}