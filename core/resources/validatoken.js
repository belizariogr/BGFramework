"use strict";

class ValidaToken extends Controller {

	constructor() {
		super('validatetoken', '/validatetoken', true);
	}

	async post (req, res){
		try {			
			var token_obj = req.server.tokenService.verify(req.body.token);
			var offset = new Date().getTimezoneOffset() * 60;
			var d = new Date();
			d.setTime((token_obj.iat - offset) * 1000);
			d.setHours(0,0,0,0);
			var now = new Date();
			now.setTime(now.getTime() - offset * 1000);
			now.setHours(0,0,0,0);
			if (!token_obj || d.getTime() != now.getTime())
				return res.status(401).json({error: 'You need a valid token to acess the server.'})
			res.json({iat: new Date().getTime()});
		} catch(err){
			res.status(401).json({error: 'You need a valid token to acess the server.'})
			throw err;
		}
	}

}

module.exports = ValidaToken;