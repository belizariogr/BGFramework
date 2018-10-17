"use strict";

const Server = require('./server.js');

class Loader {

	constructor(){
		this.cluster = require('cluster');
		this.config = require('../config');		
		if (this.config.useCluster && this.cluster.isMaster)
			this.initClusters();
		else
			this.initServer();
	}

	initClusters(){
		let workers = this.config.workersCount > 0 ? this.config.workersCount : require('os').cpus().length;
		for (let i = 0; i < workers; i++)
			this.cluster.fork();
		this.cluster.on('exit', () => this.cluster.fork());
	}

	initServer(){
		(new Server(this.config, this.cluster.worker)).start();
	}

}

module.exports = Loader;