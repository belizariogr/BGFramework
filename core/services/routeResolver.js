module.exports.routeResolver = function(config, routes, httpServer, secureRoutes){
	if (!!config.allow_register)
		routes.add(require('../resources/register.js'));
	routes.add(require('../resources/login.js'));
	routes.add(require('../resources/validatoken.js'));
	var contexts = Object.keys(config.resources);
	contexts.forEach(function(context){
		config.resources[context].forEach(function(r){
			var route = require('../../resources/' + context  + '/' + r + '/controller.js');
			route.filepath = '../resources/' + context  + '/' + r + '/';
			if (typeof route.get != "function" && typeof route.post != "function" &&  typeof route.put != "function" && typeof route.delete != "function")
				route.model = getModel(route.filepath);
			routes.add(route);
			if (!!route.model){
				if (!!route.list)
					route._list = function(req, res){ route.model.get(req, res); };
				if (!!route.record)
					route._record = function(req, res){ route.model.get(req, res); };
				if (!!route.insert){
					route._insert = function(req, res){
						var before = function(rec){
							if (route.validateRecord)
								route.validateRecord(rec);
							if (route.beforeInsert)
								route.beforeInsert(rec);
						};
						route.model.insert(req, res, before, route.afterInsert);
					}
				};
				if (!!route.update){
					route._update = function(req, res){
						var before = function(rec){
							if (route.validateRecord)
								route.validateRecord(rec);
							if (route.beforeUpdate)
								route.beforeUpdate(rec)
						};
						route.model.update(req, res, before, route.afterUpdate);
					}
				};
				if (!!route.delete)
					route._delete = function(req, res){ route.model.delete(req, res, route.beforeDelete, route.afterDelete); }
			}
		});

		routes.items.forEach(function(r){
			if (!!r.model){
				if (r.list){
					if (r.isPublic)
						httpServer.get('/api' + r.path, r._list);
					else
						secureRoutes.get(r.path, r._list);
				};
				if (r.record){
					if (r.isPublic)
						httpServer.get('/api' + r.path + '/:id', r._record);
					else
						secureRoutes.get(r.path + '/:id', r._record);
				};
				if (r.insert){
					if (r.isPublic)
						httpServer.post('/api' + r.path, r._insert);
					else
						secureRoutes.post(r.path, r._insert);
				};
				if (r.update){
					if (r.isPublic){
						httpServer.put('/api' + r.path, r._update);
						httpServer.put('/api' + r.path + '/:id', r._update);
					} else {
						secureRoutes.put(r.path, r._update);
						secureRoutes.put(r.path + '/:id', r._update);
					}
				};
				if (r.delete){
					if (r.isPublic){
						httpServer.delete('/api' + r.path, r._delete);
						httpServer.delete('/api' + r.path + '/:id', r._delete);
					} else {
						secureRoutes.delete(r.path, r._delete);
						secureRoutes.delete(r.path + '/:id', r._delete);
					}
				};
			} else {
				if (typeof r.get == "function"){
					if (r.isPublic)
						httpServer.get('/api' + r.path, r.get);
					else
						secureRoutes.get(r.path, r.get);
				};
				if (typeof r.post == "function"){
					if (r.isPublic)
						httpServer.post('/api' + r.path, r.post);
					else
						secureRoutes.post(r.path, r.post);
				};
				if (typeof r.put == "function"){
					if (r.isPublic)
						httpServer.put('/api' + r.path, r.put);
					else
						secureRoutes.put(r.path, r.put);
				};
				if (typeof r.delete == "function"){
					if (r.isPublic)
						httpServer.delete('/api' + r.path, r.delete);
					else
						secureRoutes.delete(r.path, r.delete);
				};
			}
		})
	})
}

