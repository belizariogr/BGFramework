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

	this.get = function(req, res){
		try{
			var where = "";
			var tableName = this.resource;
			if (!!req.query)
				var params = req.query;
			var select = "";
			var conditions = [];
			var pageSql = "";
			if (!!params){
				for (var prop in params){
					if (prop != 'order' && prop != 'page' && prop != 'sort'){
						var fields = prop.split("|");
						var c = 0;
						for (var i = 0; i < fields.length; i++){
							var f = this.fieldByName(fields[i]);
							if (fields[i].toLowerCase() == config.account_field.toLowerCase()){
								f = {dataType: "integer", searchable: true};
							};
							if (!f || !f.searchable){
								console.log("No field found.")
								res.status(500).send('Cannot GET.');
								return
							} else {
								c++;
								var cond = {
									field: fields[i],
									dataType: f.dataType,
									options: f.options,
									contains: f.contains,
									startOr: (fields.length > 1 && i == 0),
									endOr: (fields.length > 1 && i == fields.length - 1)
								};
								try{
									var value = [];
									if (typeof params[prop] == "string"){
										var value = params[prop].split("|");
										cond.value = value[0];
									} else
									  cond.value= params[prop];
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
									} else if (cond.options)
										cond.values = value;
									conditions.push(cond);
								}catch(err){
									console.log(err)
									res.status(500).send('Cannot GET.');
									return
								}
							}
						}
						if (c == 1 && fields.length > 1)
							conditions[conditions.length - 1].endOr = conditions[conditions.length - 1].startOr;
					}
				}
			}

			for (var i = 0; i < this.fields.length; i++){
				select += this.fields[i].name + ' "' + this.fields[i].name + '"';
				if (i !== this.fields.length - 1)
					select += ",";
				select += " ";
			}

			var list = this;
			where = "";
			var orBlock = false;
			if (!!conditions.length > 0){
				conditions.forEach(function(c){
					if (c.dataType == "date"){
						if (c.valueEnd)
							where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "CAST(" + c.field + " AS DATE) BETWEEN " + db_conn.escape(c.value) + " AND " + db_conn.escape(c.valueEnd);
						else
							where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "CAST(" + c.field + " AS DATE) = " + db_conn.escape(c.value);
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
					} else if (c.options || c.dataType == "bool"){
						where += (!where ? "" : " AND ") + c.field + " IN (";
						var ins = '';
						c.values.forEach(function(v){
							ins += (ins ? ', ' : '') + db_conn.escape(v)
						});
						where += ins + ")";
					} else if (c.contains){
						c.value = "%" + c.value.replace(" ", "%") + "%";
						where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "LOWER(" + c.field + ") LIKE LOWER(" + db_conn.escape(c.value) + ")";
						if (c.startOr)
							orBlock = true;
						if(c.endOr){
							where += ")";
							orBlock = false;
						}
					} else {
						where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + c.field + " = " + db_conn.escape(c.value);
						if (c.startOr)
							orBlock = true;
						if(c.endOr){
							where += ")";
							orBlock = false;
						}
					}
				});
			}

			var orderby = "";
			if (!!params && !!params.order){
				if (!!params.sort && params.sort.toLowerCase() === "desc")
					orderby = " desc";
				orderby = " ORDER BY " + params.order + orderby;
			}
			if (where)
				where = 'WHERE ' + where;
			var page = 0;
			if (params.page)
				page = parseInt(params.page);

			var sql = db_conn.getSelectSQL(tableName, select, where, "", orderby, page);
			var exec = function(c){
				db_conn.query(sql, function(error, result, fields){
					if (!!error) {
						console.log('' + error);
						res.status(500).send('Cannot GET.');
					} else {
						if (page){
							c = c - 1;
							list.dataset = {page: page, pagecount: Math.floor(c / config.page_records) + 1, iat: new Date().getTime(), rows: result};
						} else
							list.dataset = {iat: new Date().getTime(), rows: result};
						res.json(list.dataset);
					}
				});
			}

			var countSQL = "";
			if (!!params && !!params.page){
				countSQL = "SELECT count(*) \"count\" FROM " + tableName + " " + where;
				db_conn.query(countSQL, function(err, results){
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

		} catch(err){
			console.log(err);
			res.status(500).send('Cannot GET: ' + err);
		}
	}
}