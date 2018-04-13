'use strict'

module.exports.express_config = function(config, routes, express, httpServer, secureRoutes){

	var bodyParser = require('body-parser');

	if (config.use_public_html){
		httpServer.use(express.static('public_html'));
	}
	httpServer.use(bodyParser.json());

	var contexts = Object.keys(config.resources);
	contexts.forEach(function(context){
		httpServer.use('/api/' + context, secureRoutes);
	});

	// Middleware

	secureRoutes.use(function(req, res, next){

		var auth = req.headers.authorization || '';
		var token = auth.substring(7);

		if (!auth.startsWith("Bearer ")){
			res.status(401).json({error: 'You need a valid token to acess the server.'});
			return
		}

		try{
			req.token_obj = token_service.verify(token);
			if (!req.token_obj) {
				res.status(401).json({error: 'You need a valid token to acess the server.'})
			}
			else {
				if (req.method == "POST" || req.method == "PUT" || req.method == "DELETE") {
					if (req.body && req.body.Account && req.body.Account !== req.token_obj.Account)
						res.status(401).json({error: 'You need a valid token to acess the server.'})
					else
						next();
				}
				else
					next();
			}
		} catch(err){
			res.status(401).json({error: 'You need a valid token to acess the server.'})
		}
	});
}

