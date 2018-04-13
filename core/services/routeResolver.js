'use strict'

module.exports.routeResolver = function(config, routes, httpServer, secureRoutes){

	var contexts = Object.keys(config.resources);
	contexts.forEach(function(context){		
		config.resources[context].forEach(function(r){		
			var route = require('../../resources/' + context  + '/' + r + '/route.js').route();
			route.filepath = '../../resources/' + context  + '/' + r + '/';
			routes.add(route);
			if (!!route.canGetList && !route.list){
				route.list = function(req, res){													
					getList(route.filepath).get(req, res);			
				}
			}
			if (!!route.canGetRecord && !route.record){
				route.record = function(req, res){			
					getRecord(route.filepath).get(req, res);			
				}
			}

			if (!!route.canInsert && !route.insert){
				route.insert = function(req, res){ 					
					var record = getRecord(route.filepath);										
					var before = function(rec, callback){
						if (record.validateRecord)
							record.validateRecord(rec);
						if (record.beforeInsert)
							record.beforeInsert(rec, callback);
						else
							callback();
					};
					record.insert(req, res, before, record.afterInsert);
				}
			}

			if (!!route.canUpdate && !route.update){
				route.update = function(req, res){
					var record = getRecord(route.filepath);
					var before = function(rec, callback){
						if (record.validateRecord)
							record.validateRecord(rec);
						if (record.beforeUpdate)
							record.beforeUpdate(rec, callback)
						else
							callback();
					};					
					record.update(req, res, before, record.afterUpdate);
				}
			}

			if (!!route.canDelete && !route.delete){
				route.delete = function(req, res){ 
					var record = getRecord(route.filepath);					
					record.delete(req, res, record.beforeDelete, record.afterDelete);
				}
			}
		});

		routes.items.forEach(function(r){
			if (r.list){
				if (r.isPublic)				
					httpServer.get('/api' + r.path, r.list);
				else 
					secureRoutes.get(r.path, r.list);
			}

			if (r.record){
				if (r.isPublic)
					httpServer.get('/api' + r.path + '/:id', r.record);
				else 
					secureRoutes.get(r.path + '/:id', r.record);
			}

			if (!r.list && !r.record && r.get){
				if (r.isPublic){
					httpServer.get('/api' + r.path, r.get);
					httpServer.get('/api' + r.path + '/:id', r.get);
				}
				else {
					secureRoutes.get(r.path, r.get);
					secureRoutes.get(r.path + '/:id', r.get);
				}
			}

			if (r.insert){
				if (r.isPublic)
					httpServer.post('/api' + r.path, r.insert);
				else
					secureRoutes.post(r.path, r.insert);
			}

			if (r.update){
				if (r.isPublic)
					httpServer.put('/api' + r.path, r.update);
				else
					secureRoutes.put(r.path, r.update);
			}

			if (r.post){
				if (r.isPublic)
					httpServer.post('/api' + r.path, r.post);
				else
					secureRoutes.post(r.path, r.post);
			}

			if (r.delete){
				if (r.isPublic)
					httpServer.delete('/api' + r.path, r.delete);
				else
					secureRoutes.delete(r.path, r.delete);
			}
		});
	});
}

