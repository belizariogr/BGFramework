"use strict";

class RouteResolver {

	static getModel(server, dir) {
		let modelClass = require(dir + '/model');
		let model = new modelClass(server);	
		if (!!model.fields){
			if (server.config.deletionField)
				model.fields.unshift({name: server.config.deletionField, dataType: "datetime"});
			if (server.config.modificationField)
				model.fields.unshift({name: server.config.modificationField, dataType: "datetime"});
			if (server.config.creationField)
				model.fields.unshift({name: server.config.creationField, dataType: "datetime"});
			if (server.config.systemUserField)
				model.fields.unshift({name: server.config.systemUserField, dataType: "integer", key: true, hidden: true});
		}		
		return model; 
	}

	static getRoutes(server) {

		let add = (path, file) => {
			let routeClass = require(path + '/' + file);
			let route = new routeClass(server);
			route.filepath = path;
			server.routes.add(route);
			return route;			
		}

		if (!!server.config.allowRegister) 
			add('../resources', 'register');
		add('../resources', 'login');
		add('../resources', 'validatoken');		
		let contexts = Object.keys(server.resources);
		contexts.forEach(context => {
			server.resources[context].forEach(r => {
				let route = add('../../resources/' + context  + '/' + r, 'controller');				
				if (typeof route.get != "function" && typeof route.post != "function" &&  typeof route.put != "function" && typeof route.delete != "function")
					route.model = this.getModel(server, route.filepath);				
				if (!!route.model){
					if (!!route.list)
						route._list = (req, res) => route.model.list(req, res);
					if (!!route.record)
						route._record = (req, res) => route.model.record(req, res);
					if (!!route.insert){
						route._insert = (req, res) => {
							var before = (rec) => {
								if (route.validateRecord)
									route.validateRecord(rec);
								if (route.beforeInsert)
									route.beforeInsert(rec);
							};
							route.model.insert(req, res, before, route.afterInsert);
						}
					};
					if (!!route.update){
						route._update = (req, res) => {
							var before = (rec) => {
								if (route.validateRecord)
									route.validateRecord(rec);
								if (route.beforeUpdate)
									route.beforeUpdate(rec)
							};
							route.model.update(req, res, before, route.afterUpdate);
						}
					};
					if (!!route.delete)
						route._delete = (req, res) => route.model.delete(req, res, route.beforeDelete, route.afterDelete);
				}
			});			
		});
	}

	static resolveRequests(server) {
		server.routes.items.forEach(r => {
			if (!!r.model){
				if (r.list){
					if (r.isPublic)
						server.httpServer.get('/api' + r.path, r._list);
					else
						server.secureRouter.get(r.path, r._list);
				};
				if (r.record){
					if (r.isPublic)
						server.httpServer.get('/api' + r.path + '/:id', r._record);
					else
						server.secureRouter.get(r.path + '/:id', r._record);
				};
				if (r.insert){
					if (r.isPublic)
						server.httpServer.post('/api' + r.path, r._insert);
					else
						server.secureRouter.post(r.path, r._insert);
				};
				if (r.update){
					if (r.isPublic){
						server.httpServer.put('/api' + r.path, r._update);
						server.httpServer.put('/api' + r.path + '/:id', r._update);
					} else {
						server.secureRouter.put(r.path, r._update);
						server.secureRouter.put(r.path + '/:id', r._update);
					}
				};
				if (r.delete){
					if (r.isPublic){
						server.httpServer.delete('/api' + r.path, r._delete);
						server.httpServer.delete('/api' + r.path + '/:id', r._delete);
					} else {
						server.secureRouter.delete(r.path, r._delete);
						server.secureRouter.delete(r.path + '/:id', r._delete);
					}
				};
			} else {
				if (typeof r.get == "function"){
					if (r.isPublic)
						server.httpServer.get('/api' + r.path, r.get);
					else
						server.secureRouter.get(r.path, r.get);
				};
				if (typeof r.post == "function"){
					if (r.isPublic)
						server.httpServer.post('/api' + r.path, r.post);
					else
						server.secureRouter.post(r.path, r.post);
				};
				if (typeof r.put == "function"){
					if (r.isPublic)
						server.httpServer.put('/api' + r.path, r.put);
					else
						server.secureRouter.put(r.path, r.put);
				};
				if (typeof r.delete == "function"){
					if (r.isPublic)
						server.httpServer.delete('/api' + r.path, r.delete);
					else
						server.secureRouter.delete(r.path, r.delete);
				};
			}
		})
	}

}

module.exports = RouteResolver;