"use strict";


const Token = require('./services/token');
const Resources = require('./services/resources');
const RouteResolver = require('./services/routeResolver');
const Routes = require('./services/routes');

global.error = require('./lib/errors')
global.Model = require('./lib/model');
global.Controller = require('./lib/controller');
global.DB = require('./lib/db');
global.DataSet = require('./lib/dataset');
global.Utils = require('./lib/utils');
global.DBUtils = require('./lib/dbutils');
global.SQLHelper = require('./lib/sqlhelper');


class Server {

	constructor(config, worker){		
		this.config = config;	
		this.worker = worker;		
		this.initHttpServer();
		this.initServices();
		this.initMiddleware();
		this.initDatabase();
	}

	initHttpServer(){		
		this.express = require('express');
		this.secureRouter = this.express.Router();
		this.cors = require('cors');
		this.httpServer = this.express();
		this.httpServer.use(this.cors());
	}

	initServices(){
		this.bcrypt = require('bcrypt');
		this.saltRounds = 10;
		this.routes = new Routes(this);
		this.tokenService = new TokenService(this.config);	
		this.extras = Resources.getExtras();
		this.resources = Resources.getResources();
	}

	initMiddleware() {		
		this.bodyParser = require('body-parser');
		if (this.config.usePublicHtml)
			this.httpServer.use(this.express.static('public_html'));
		this.httpServer.use(this.bodyParser.json());		

		let contexts = Object.keys(this.resources);
		contexts.forEach(context => this.httpServer.use('/api/' + context, this.secureRouter));		
		
		this.httpServer.use((req, res, next) => {
			req.server = this;
			next();
		});

		this.secureRouter.use((req, res, next) => {
			req.server = this;
			let auth = req.headers.authorization || '';
			let token = auth.substring(7);			
			if (!auth.startsWith("Bearer "))
				return res.status(401).json({error: 'You need a valid token to acess the server.'});			
			try{
				req.token_obj = this.tokenService.verify(token);				
				if (!req.token_obj)
					return res.status(401).json({error: 'You need a valid token to acess the server.'})
				req.$account = req.token_obj.Account;				
				if (req.method == "POST" || req.method == "PUT" || req.method == "DELETE"){										
					if (Array.isArray(req.body))
						req.body.forEach(b => b[req.server.config.accountField] = req.token_obj.Account);
					else if (typeof req.body == "object")
						req.body[req.server.config.accountField] = req.token_obj.Account;
				} else 
					req.query[req.server.config.accountField] = req.token_obj.Account;
				next();
			} catch(err){
				res.status(401).json({error: 'You need a valid token to acess the server.'})
			}
		}); 

		RouteResolver.getRoutes(this);
		RouteResolver.resolveRequests(this);
	}

	initDatabase() {
		let dbClass = require('./database/' + this.config.databaseType);
		this.db = new dbClass(this);
	}

	start(){
		this.httpServer.listen(this.config.httpPort);
		if (this.config.useCluster)
			console.log('Worker ' + this.worker.id + ' is running...');
		else
			console.log('Server is running on port ' + this.config.httpPort + '...');
	}

}

module.exports = Server;