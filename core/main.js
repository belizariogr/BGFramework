module.exports.run = function(){
	const routes = require('./services/routes.js');
	const express = require('express');
	const secureRouter = express.Router();
	const cors = require('cors');
	const httpServer = express();
	httpServer.use(cors());
	global.error = function(code, message){
		throw {code: code, message: message}
	}

	require('./services/express_config.js').express_config(config, routes, express, httpServer, secureRouter);
	require('./services/routeResolver.js').routeResolver(config, routes, httpServer, secureRouter);

	httpServer.listen(config.http_port);
	if (config.use_cluster)
		console.log('Worker ' + cluster.worker.id + ' is running...');
	else
		console.log('Server is running on port ' + config.http_port + '...');
}