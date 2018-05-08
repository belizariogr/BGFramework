module.exports.RecordPrototype = function(){
	this.resource = "";
	this.fields = [];

	var getDataSet = function(fields, rec){
		var dataSet = {fields:[], values: []};
		var keys = Object.keys(rec);
		var notFound = [];
		keys.forEach(function(k){
			var found = false;
			fields.forEach(function(f){
				if (("" + f.name).toLowerCase() == k.toLowerCase()){
					if (!f.readOnly){
						var value = rec[k];
						if (f.required && (value === null || value === undefined)){
							dataSet.errorMsg = 'Field "' + f.name + '" is required.';
							return
						} else if (!(value === null || value === undefined)){
							if (f.dataType == "integer"){
								if (isNaN(value) || !Number.isInteger(Number(value))){
									dataSet.errorMsg = 'Invalid integer value (' + value + ') for field "' + f.name + '."';
									dataSet.errorField = f.name;
									dataSet.errorDataType = f.dataType;
									dataSet.errorValue = value;
									return
								}
							} else if (f.dataType == "float") {
								if (isNaN(value)){
									dataSet.errorMsg = 'Invalid float value (' + value + ') for field "' + f.name + '."';
									dataSet.errorField = f.name;
									dataSet.errorDataType = f.dataType;
									dataSet.errorValue = value;
									return
								}
							} else if (f.dataType == "date" || f.dataType == "time" || f.dataType == "datetime") {
								var d = new Date(value);
								if (isNaN(d.getTime())){
									dataSet.errorMsg =  'Invalid datetime value for field "' + f.name + '."';
									dataSet.errorField = f.name;
									dataSet.errorDataType = f.dataType;
									dataSet.errorValue = value;
									return
								}
							} else if (f.dataType == "bool") {
								if (typeof(value) == "boolean"){
									value = value ? 'T' : 'F';
								} else if (value != "T" && value != "F"){
									dataSet.errorMsg = 'Invalid bool value (' + value + ') for field "' + f.name + '."';
									dataSet.errorField = f.name;
									dataSet.errorDataType = f.dataType;
									dataSet.errorValue = value;
									return
								}
							} else if (f.dataType != "string")
								throw 'Field "' + f.name + '" has an invalid data type.';
						}
						dataSet.fields.push(f.name);
						dataSet.values.push(value);
					}
					found = true;
				}
			});
			if (!found)
				notFound.push(k);
		});

		if (!dataSet.errorMsg && notFound.length > 0){
			var err = "";
			notFound.forEach(function(n){
				err += (err ? ", " : "") + "'" + n + "'";
			});
			err = "Field(s) not found in model: " + err;
			throw err;
		}

		dataSet.setValue = function(field, value){
			var found = false;
			for (var i = 0; i < this.fields.length; i++) {
				if (this.fields[i] == field){
					this.values[i] = value;
					found = true;
				}
			}
			if (!found){
				this.fields.push(field);
				this.values.push(value);
			}
		}
		return dataSet;
	}

	this.get = function(req, res){
		try {
			var where = "";
			var table = this.resource;
			var params = {};
			var query;

			if (!!req.query && Object.keys(req.query).length !== 0){
				query = req.query;
				for (var q in query)
					params[q.toLowerCase()] = query[q];
			} else {
				var k = this.fields.filter(function(f){ return f.key });
				if (!k || !Array.isArray(k) || k.length == 0)
					throw 'No key fields.';
				if (req.params) {
					k.forEach(function(key){
						params[key.name.toLowerCase()] = req.params[key.name.toLowerCase()];
					});
				}
			};
			params[config.account_field.toLowerCase()] = req.$account;

			var keys = this.fields.filter(function(f){ return f.key });
			if (!keys || !Array.isArray(keys) || keys.length == 0)
				throw 'No key fields.';
			keys.forEach(function(k){
				var name = k.name.toLowerCase();
				if (!params[name])
					throw 'No value for key: ' + name ;
				else
					where += (!where ? "" : " AND ") + name + " = " + params[name];
			});

			var sql = "SELECT ";
			for (var i = 0; i < this.fields.length; i++){
				if (!this.fields[i].hidden){
					sql += (this.fields[i].sqlField || this.fields[i].name) + ' "' + this.fields[i].name + '"';
					if (i !== this.fields.length - 1)
						sql += ",";
					sql += " ";
				}
			}
			sql += "FROM " + this.resource + " WHERE " + where;
			global.db_conn.query(sql, "", function(error, rows, fields){
				try{
					if (error)
						throw error;
					else
						res.send(rows[0]);
				}catch(err){
					console.log("" + err);
					res.status(500).send('Cannot GET.');
				}
			});
		}catch(err){
			console.log(err);
			res.status(500).send('Cannot GET: ' + err);
		}
	};

	this.execute = function(action, req, res, before, after, execCallback){
		var table = this.resource;
		var fields = this.fields;
		var autoIncField = "";
		try {
			var rec;
			for (var r in req.body){
				if (!rec)
					rec = {};
				rec[r.toLowerCase()] = req.body[r];
			}
			if (!rec)
				throw "You need to pass a valid record.";
			if (action.toLowerCase() == "update" || action.toLowerCase() == "delete"){
				var keys = fields.filter(function(f){ return f.key });
				if (!keys || !Array.isArray(keys) || keys.length == 0)
					throw 'No key fields.';

				keys.forEach(function(k){
					var name = k.name.toLowerCase();
					if (!rec[name])
						throw 'No value for key.';
				});
			} else if (action.toLowerCase() == "insert"){
				var f = fields.filter(function(f){ return !!f.autoInc; });
				if (f.length > 1)
					throw "Model has more than one auto incremet field.";
				else if (f.length == 1)
					autoIncField = f[0].name;
			}
			var dataSet = getDataSet(fields, rec);

			if (dataSet.errorMsg){
				res.status(500).json({type: 1, error: "" + dataSet.errorMsg, dataType: dataSet.errorDataType, field: dataSet.errorField, value: dataSet.errorValue});
				return
			}

			var executeInsert = function(){

				var execIns = function(err, autoIncValue){
					if (err){
						console.log(err);
						console.log('SQL = ' + sql);
						finalizeTransaction({type: 2, error: "Cannot INSERT."});
						return
					}
					if (!!autoIncValue)
						dataSet.setValue(autoIncField, autoIncValue);
					var sql = "INSERT INTO " + table + " (";
					var ins = "";
					var vals = "";
					dataSet.fields.forEach(function(f){
						ins += (!ins ? "" : ", ") + f;
						vals += (!vals ? "" : ", ") + '?';
					});
					sql += ins + ") VALUES (" + vals + ")";
					global.db_conn.query(sql, dataSet.values, function(err){
						try{
							if (err)
								throw err;
							if (after)
								after(req.body, finalizeTransaction)
							else
								finalizeTransaction();
						} catch(err) {
							console.log(err);
							console.log('SQL = ' + sql);
							finalizeTransaction({type: 2, error: "Cannot INSERT."});
						}
					});
				};

				if (!!global.config.use_autoinc && !!autoIncField)
					global.db_conn.getAutoIncId(req.token_obj.Account, table, execIns);
				else
					execIns();
			};

			var executeUpdate = function(){
				var sql = "UPDATE " + table + " SET ";
				var upd = "";
				var whr = "";
				var vals = dataSet.values;
				dataSet.fields.forEach(function(f){
					upd += (!upd ? "" : ", ") + f + " = ? ";
				});
				sql += upd + " WHERE ";
				keys.forEach(function(k){
					whr += (!whr ? "" : "AND ") + k.name + " = ? ";
					vals.push(rec[k.name.toLowerCase()]);
				});

				sql += whr;
				global.db_conn.query(sql, vals, function(err){
					try{
						if (err)
							throw err;
						if (after)
							after(req.body, finalizeTransaction)
						else
							finalizeTransaction();
					}catch(err){
						console.log(err);
						console.log('SQL = ' + sql);
						finalizeTransaction({type: 2, error: "Cannot UPDATE."});
					}
				});
			};

			var executeDelete = function(){
				var sql = "DELETE FROM " + table;
				var whr = "";
				var vals = [];
				keys.forEach(function(k){
					whr += (!whr ? "" : "AND ") + k.name + " = ? ";
					vals.push(rec[k.name.toLowerCase()]);
				});

				sql += " WHERE " + whr;

				global.db_conn.query(sql, vals, function(err){
					try{
						if (err)
							throw err;
						if (after)
							after(req.body, finalizeTransaction)
						else
							finalizeTransaction();
					}catch(err){
						console.log(err);
						console.log('SQL = ' + sql);
						finalizeTransaction({type: 2, error: "Cannot DELETE."});
					}
				});
			};

			var executeTransaction = function(callback){
				if (action.toLowerCase() == "insert")
					var exec = executeInsert;
				else if (action.toLowerCase() == "update")
					var exec = executeUpdate;
				else if (action.toLowerCase() == "delete")
					var exec = executeDelete;
				if (before){
					try{
						before(req.body, exec);
					}catch(err){
						callback({type: 1, error: err})
					}
				} else
					exec();
			};

			var finalizeTransaction = function(err){
				if (execCallback)
					execCallback(err, req.body)
				else{
					if (err) {
						if (!!err.type && err.type == 1)
							res.status(500).json(err);
						else if (!!err.type && err.type != 1)
							res.status(500).json({type: 0, error: "" + err});
						else
							throw err;
					} else
						res.status(204).send();
				}
			};
			executeTransaction(finalizeTransaction);
		}catch(err){
			console.log(err)
			res.status(500).json({type: 0, error: "" + err});
		}
	};

	this.insert = function(req, res, before, after){
		this.execute("insert", req, res, before, after);
	};

	this.update = function(req, res, before, after){
		this.execute("update", req, res, before, after);
	};

	this.delete = function(req, res, before, after){
		try{
			var table = this.resource;
			var fields = this.fields;
			var recs = req.body;
			var responses = [];
			if (!recs || recs.length == 0 || typeof recs !== 'object' || Object.keys(recs).length === 0)
				throw "Invalid request for DELETE.";
			for(var i = 0; i < recs.length; i++) {
				req.body = recs[i];
				this.execute("delete", req, res, before, after, function(err, rec){
					if (err){
						responses.push({Id: rec.Id, success: false});
						console.log(err);
					} else
						responses.push({Id: rec.Id, success: true});

					if (responses.length == recs.length){
						var hasError = responses.some(function(r){ return !r.success; });
						res.status(hasError ? 500 : 200).send(responses);
					}
				});
			};
		}catch(err){
			console.log(err)
			res.status(500).json({type: 0, error: "" + err});
		}
	};

}