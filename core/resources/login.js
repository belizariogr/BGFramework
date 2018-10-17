"use strict";

class Login extends Controller {

	constructor() {		
		super('login', '/login', true);
	}

	async post (req, res){		
		let server = req.server;		
		if (!req.body || !req.body.username || !req.body.password)
			return res.json({ error: 'Invalid username or password.' });
		try {						
			let rec = DBUtils.normatizeObject(req.body);
			let sql = "SELECT " + server.config.accountIdField + ", " + server.config.accountUsername + ", " + server.config.accountPassword + " FROM " + server.config.accountTable + " WHERE " + server.config.accountUsername + " = ?";
			let result = await server.db.query(sql, [rec.username]);
			if (!!result.err)
				throw result.err;
			if (result.rows.length == 0)
				return res.json({error: 'Invalid username or password.'});
			let id, username, password;
			if (!!result.rows[0]) {
				id = Utils.getPropValue(result.rows[0], server.config.accountIdField);
				username = Utils.getPropValue(result.rows[0], server.config.accountUsername);
				password = Utils.getPropValue(result.rows[0], server.config.accountPassword);
			};
			if (!username)
				return res.json({error: 'Invalid username or password.'});
			if (server.config.encryptPassword) {
				server.bcrypt.compare(rec.username + '||'+ rec.password, password, (err, valid) => {
				    if (valid)
				    	res.json(server.tokenService.login(id, id));
				    else
				    	res.json({error: 'Invalid username or password.'});
				});
			} else {
				if (password === rec.password)
					res.json(server.tokenService.login(id, id));
				else
					res.json({error: 'Invalid username or password.'});
			}
		} catch(err) {
			if (server.config.debug)			
				console.log(err)
			res.json({error: "Error on login."});
		}
	}

}

module.exports = Login;