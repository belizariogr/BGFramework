module.exports.execute = function(){
	global.cluster = require('cluster');
	if (!global.config)	global.config = require('../config.js');
	if (global.config.use_cluster && cluster.isMaster) {
		global.config = require('../config.js');
		console.log('Server is running on port ' + config.http_port + '...');
		var workers = global.config.workers_count > 0 ? global.config.workers_count : require('os').cpus().length;
		for (var i = 0; i < workers; i++)
			cluster.fork();
		cluster.on('exit', function(){ cluster.fork(); });
	} else {
		require('./setup.js').setup();
		require('./main.js').run();
	}
}