'use strict'

module.exports.ListPrototype = function(){
	this.resource = "";
	this.fields = [];
	this.pagecount = 0;
	this.page = 0;

	this.fieldByName = function(fieldName){
		var field;
		this.fields.forEach(function(f){
			if (f.name.toLowerCase() == fieldName.toLowerCase()){
				field = f;
				return;
			}
		})
		if (!!field)
			return field;
	}

	this.query = function(req, res, sql){
		global.db_conn.query(sql, function(error, rows){
			if (!!error) {
				console.log('' + error);
				res.status(500).send('Cannot GET.');
			} else {
				list.dataset = {rows: rows};
				res.json(list.dataset);
			}
		});
	};

	this.get = function(req, res){
		try{
			var where = "";
			var tableName = this.resource;
			if (!!req.query)
				var params = req.query;
			var select_sql = "SELECT ";
			var conditions = [];
			var pageSql = "";
			if (!!params){
				for (var prop in params){
					if (prop != 'order' && prop != 'page' && prop != 'sort'){
						var fields = prop.split("|");
						var c = 0;
						for (var i = 0; i < fields.length; i++){
							var f = this.fieldByName(fields[i]);
							if (!f || !f.searchable){
								res.status(500).send('Cannot GET.');
								return
							} else {
								c++;
								var cond = {
									field: fields[i],
									dataType: f.dataType,
									isOptions: f.isOptions,
									contains: f.contains,
									startOr: (fields.length > 1 && i == 0),
									endOr: (fields.length > 1 && i == fields.length - 1)
								};
								try{
									var value = params[prop].split("|");
									cond.value = value[0];
									if (value.length == 2)
										cond.valueEnd = value[1];

									if (cond.dataType == "date"){
										var d = new Date(cond.value);
										if (isNaN(d.getTime()))
											throw 'Invalid Date';
										cond.value = d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate();
										if (cond.valueEnd){
											d = new Date(cond.valueEnd);
											if (isNaN(d.getTime()))
												throw 'Invalid Date';
											cond.valueEnd = d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate();
										}
									} else if (cond.dataType == "integer" || cond.dataType == "numeric") {
										if (isNaN(cond.value))
											throw 'Invalid Number';
										if (cond.valueEnd)
											if (isNaN(cond.valueEnd))
												throw 'Invalid Number';
									} else if (cond.dataType == "bool") {
										if (!(new Set('F', 'T', 'F|T', 'T|F')).has(value))
											throw "Invalid bool.";
										cond.value = value;
									} else if (cond.isOptions)
										cond.values = value;
									conditions.push(cond);
								}catch(err){
									res.status(500).send('Cannot GET.');
									return
								}
							}
						}
						if (c == 1 && fields.length > 1)
							conditions[conditions.length - 1].endOr = conditions[conditions.length - 1].startOr;
					}
				}
				if (params.page){
					var page = parseInt(params.page);
					var limitNumber = (page - 1) * global.config.page_records;
					if (limitNumber != NaN)
						select_sql += "FIRST " + global.config.page_records + " SKIP " + limitNumber + " ";
				}

			}

			for (var i = 0; i < this.fields.length; i++){
				select_sql += this.fields[i].name + ' "' + this.fields[i].name + '"';
				if (i !== this.fields.length - 1)
					select_sql += ",";
				select_sql += " ";
			}
			select_sql += "FROM " + this.resource;
			var list = this;
			where = "";

			if (!!global.account_check)
				where += global.account_check('list', this.resource, req.token_obj, req) || "";
			var orBlock = false;
			if (!!conditions.length > 0){
				conditions.forEach(function(c){
					if (c.dataType == "date"){
						if (c.valueEnd)
							where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "CAST(" + c.field + " AS DATE) BETWEEN " + firebird.escape(c.value) + " AND " + firebird.escape(c.valueEnd);
						else
							where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "CAST(" + c.field + " AS DATE) = " + firebird.escape(c.value);
						if (c.startOr)
							orBlock = true;
						if(c.endOr){
							where += ")";
							orBlock = false;
						}
					} else if (c.dataType == "integer" || c.dataType == "numeric"){
						if (c.valueEnd)
							where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + c.field + " BETWEEN " + c.value + " AND " + c.valueEnd;
						else
							where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + c.field + " = " + c.value;
						if (c.startOr)
							orBlock = true;
						if(c.endOr){
							where += ")";
							orBlock = false;
						}
					} else if (c.isOptions || c.dataType == "bool"){
						where += (!where ? "" : " AND ") + c.field + " IN (";
						var ins = '';
						c.values.forEach(function(v){
							ins += (ins ? ', ' : '') + firebird.escape(v)
						});
						where += ins + ")";
					} else if (c.contains){
						c.value = "%" + c.value.replace(" ", "%") + "%";
						where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "LOWER(" + c.field + ") LIKE LOWER(" + firebird.escape(c.value) + ")";
						if (c.startOr)
							orBlock = true;
						if(c.endOr){
							where += ")";
							orBlock = false;
						}
					} else {
						where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + c.field + " = " + firebird.escape(c.value);
						if (c.startOr)
							orBlock = true;
						if(c.endOr){
							where += ")";
							orBlock = false;
						}
					}
				});
			}

			if (where)
				where = 'WHERE ' + where;

			var orderby = "";
			if (!!params && !!params.order){
				if (!!params.sort && params.sort.toLowerCase() === "desc")
					orderby = " desc";
				orderby = " ORDER BY " + params.order + orderby;
			}

			global.db_conn.get(function(err, db){
				if (err){
					console.log(err)
					res.status(500).send('Cannot GET: ' + err);
					return
				}

				var exec = function(c){
					db.query(select_sql + " " + where + " " + orderby, function(error, result, fields){
						db.detach();
						if (!!error) {
							console.log('' + error);
							res.status(500).send('Cannot GET.');
						} else {
							if (page){
								c = c - 1;
								list.dataset = {page: page, pagecount: Math.floor(c / global.config.page_records) + 1, iat: new Date().getTime(), rows: result};
							} else
								list.dataset = {iat: new Date().getTime(), rows: result};
							res.json(list.dataset);
						}
					});
				}

				var countSQL = "";
				if (!!params && !!params.page){
					countSQL = "SELECT count(*) \"count\" FROM " + tableName + " " + where;
					db.query(countSQL, function(err, results){
						if (err){
							console.log('Error on SQL: ' + countSQL)
							console.log(err)
							res.status(500).send('Cannot GET: ' + err);
							return
						}
						var recCount = results[0].count;
						exec(recCount);
					})
				} else
					exec();
			});
		} catch(err){
			console.log(err);
			res.status(500).send('Cannot GET: ' + err);
		}
	}
}