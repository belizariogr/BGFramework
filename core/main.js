'use strict'

module.exports.run = function(){
	global.config = require('../config.js');
	global.account_check = require('../account_check.js').account_check;
	var routes = require('./services/routes.js');
	var express = require('express');
	var secureRouter = express.Router();
	var cors = require('cors');
	var httpServer = express();
	httpServer.use(cors());
	global.error = function(code, message){
		throw {code: code, message: message}
	}

	require('./services/setup.js').setup(config);

	require('./services/express_config.js').express_config(config, routes, express, httpServer, secureRouter);
	require('./services/routeResolver.js').routeResolver(config, routes, httpServer, secureRouter);

	httpServer.listen(config.http_port);
	console.log('Server is running on Port ' + config.http_port + '...');
}