module.exports = {
	name: 'login',
	path: '/login',
	isPublic: true,
	post: function(req, res){
		if (!req.body || !req.body.username || !req.body.password)			
			return res.json({ error: 'Invalid username or password.' });
		db_conn.query("SELECT " + config.account_id_field + ", " + config.account_username + ", " + config.account_password + " FROM " + config.account_table + " WHERE " + config.account_username + " = ?", [req.body.username], function(err, rows){
			if (!!err)
				return res.send(err);
			var id, username, password;
			if (!!rows[0]) {
				id = utils.getPropValue(rows[0], config.account_id_field);
				username = utils.getPropValue(rows[0], config.account_username);
				password = utils.getPropValue(rows[0], config.account_password);
			};
			if (!username)				
				return res.json({error: 'Invalid username or password.'});
			if (config.encrypt_password) {
				bcrypt.compare(req.body.username + '||'+ req.body.password, password, function(err, valid) {
				    if (valid)
				    	res.json(token_service.login(id, id));
				    else
				    	res.json({error: 'Invalid username or password.'});
				});
			} else {
				if (password === req.body.password)
					res.json(token_service.login(id, id));
				else
					res.json({error: 'Invalid username or password.'});
			}
		});
	}
}