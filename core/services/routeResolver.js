"use strict";

class RouteResolver {

	static getModel(server, dir) {
		let modelClass = require(dir + '/model');
		let model = new modelClass(server);
		if (!!model.fields){
			if (server.config.systemUserField)
				model.fields.unshift({name: server.config.systemUserField, dataType: "integer", key: true, hidden: true});

			let c = model.fields.filter(f => f.name == server.config.creationField);
			if (c.length > 0){
				c[0].isCreationField = true;
				c[0].readOnly = true;
				c[0].alias = model.alias || model.resource;
			}
			c = model.fields.filter(f => f.name == server.config.modificationField);
			if (c.length > 0){
				c[0].isModificationField = true;
				c[0].readOnly = true;
				c[0].alias = model.alias || model.resource;
			}

			c = model.fields.filter(f => f.name == server.config.deletionField);
			if (c.length > 0){
				c[0].isDeletionField = true;
				c[0].readOnly = true;
				c[0].hidden = true;
				c[0].alias = model.alias || model.resource;
			}
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
					if (!!route.list){
						let before = async (data, db, userId, cond, req, res) => {
							if (!!route.beforeList)
								await route.beforeList(data, db, userId, cond, req, res);
						}
						route._list = (req, res) => route.model.list(req, res, before);
					}
					if (!!route.record){
						let before = async (rec, db) => {
							if (!!route.beforeRecord)
								await route.beforeRecord(rec, db);
						}
						route._record = (req, res) => route.model.record(req, res, before);
					}
					if (!!route.insert){
						route._insert = (req, res) => {
							let before = async (rec, dataset, db, helper) => {
								if (route.validateRecord)
									route.validateRecord(rec, dataset, db, helper);
								if (route.beforeInsert)
									await route.beforeInsert(rec, dataset, db, helper);
							};
							let after = (rec, dataset, db, helper) => {
								if (route.afterInsert)
									route.afterInsert(rec, dataset, db, helper)
							}
							route.model.insert(req, res, before, after);
						}
					};
					if (!!route.update){
						route._update = (req, res) => {
							let before = async (rec, dataset, db, helper) => {
								if (route.validateRecord)
									route.validateRecord(rec, dataset, db, helper);
								if (route.beforeUpdate)
									await route.beforeUpdate(rec, dataset, db, helper)
							};
							let after = (rec, dataset, db, helper) => {
								if (route.afterUpdate)
									route.afterUpdate(rec, dataset, db, helper)
							}
							route.model.update(req, res, before, after);
						}
					};
					if (!!route.delete){
						let before = async (rec, dataset, db, helper) => {
							if (route.beforeDelete)
								await route.beforeDelete(rec, dataset, db, helper);
						};
						let after = (rec, dataset, db, helper) => {
							if (route.afterDelete)
								route.afterDelete(rec, dataset, db, helper)
						}
						route._delete = (req, res) => route.model.delete(req, res, before, after);
					}
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