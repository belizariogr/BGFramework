'use strict'

module.exports.setup = function(config){

	global.utils = require('./utils.js');
	global.token_service = require('./token.js');
	token_service.setup(config);

	global.extras = {};
	config.extras.forEach(function(r){
		global.utils.setPropValue(global.extras, r, require('../../extras/' + r + '.js'));
	});

	global.db_conn = require('../database/' + global.config.database_type + '/connection.js').setup(config);
	global.recordPrototype = require('../database/' + global.config.database_type + '/record_prototype.js').RecordPrototype;
	global.listPrototype = require('../database/' + global.config.database_type + '/list_prototype.js').ListPrototype;

	global.getList = function(dir){
		return (new (require(dir + '/list.js')).instance());
	}

	global.getRecord = function(dir){
		return (new (require(dir + '/record.js')).instance());
	}
}

