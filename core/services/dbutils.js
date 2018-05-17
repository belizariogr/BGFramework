module.exports = {
	getConditions: function(model, q, p) {
		var conditions = [];
		var params = {};
		if (!!p && !!q)
			params = Object.assign(q, p);
		else if (!!p)
			params = p
		else if (!!q)
			params = q;

		for (var prop in params){
			if (prop != 'order' && prop != 'page' && prop != 'sort'){
				var fields = prop.split("|");
				var c = 0;
				for (var i = 0; i < fields.length; i++){
					var f = this.fieldByName(model, fields[i]);
					if (fields[i].toLowerCase() == config.account_field.toLowerCase()){
						f = {name: config.account_field, dataType: "integer", key: true};
					};
					if (!f)
						throw 'No field found for condition.';
					else if (!f.searchable && !f.key)
						throw 'Field ' + f.name + ' cant be used for conditions.';
					else {
						c++;
						var cond = {
							field: f.name,
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
							throw err;
						}
					}
				}
				if (c == 1 && fields.length > 1)
					conditions[conditions.length - 1].endOr = conditions[conditions.length - 1].startOr;
			}
		};
		return conditions;
	},

	getOrders: function(model, params){
		var orders = [];
		if (!!params && !!params.order && typeof params.order == "string"){
			var fields = params.order.split("|");
			var sorts = [];
			if (!!params.sort && typeof params.sort == "string")
				sorts = params.sort.split("|");
			var c = 0;
			for (var i = 0; i < fields.length; i++){
				var f = this.fieldByName(model, fields[i]);
				if (fields[i].toLowerCase() == config.account_field.toLowerCase()){
					f = {};
				};
				if (!f)
					throw "No field found for sorting.";
				else {
					orders.push({
						field: fields[i],
						sort: sorts.length > i ? sorts[i] : ""
					});
				}
			}
		};
		return orders;
	},

	getPage: function(p){
		var page = 0;
		if (!!p && !!p.page)
			page = parseInt(p.page);
		return page;
	},

	fieldByName: function(model, fieldName){
		var field;
		model.fields.forEach(function(f){
			if (f.name.toLowerCase() == fieldName.toLowerCase()){
				field = f;
				return;
			}
		});
		if (!!field)
			return field;
	},

	getAutoIncFieldName: function(model){
		var f = model.fields.filter(function(f){ return !!f.autoInc; });
		return f[0].name;
	},

	getValueByIndex: function(row, index){
		return row[Object.keys(row)[index]];
	},

	normatizeObject: function(obj){
		var buf = {};
		for (var p in obj){
			buf[p.toLowerCase()] = obj[p];
		};
		return buf;
	},

	validateRecord: function(action, model, record, params){
		if (!!params) {
			var buf = Object.assign(record, params);
			var rec = this.normatizeObject(buf);
		} else
			var rec = record;
		if (!rec)
			throw 'You need to pass a valid record.';
		var keys = this.getKeys(model);
		var validate = function(rec){
			if (action.toLowerCase() == 'update' || action.toLowerCase() == 'delete'){
				if (!keys || !Array.isArray(keys) || keys.length == 0)
					throw 'No key fields.';
				keys.forEach(function(k){
					var name = k.name.toLowerCase();
					if (!rec[name])
						throw 'No value for key.';
				});
			} else if (action.toLowerCase() == 'insert'){
				var f = model.fields.filter(function(f){ return !!f.autoInc; });
				if (f.length > 1)
					throw 'Model has more than one auto incremet field.';
			}
		};
		if (Array.isArray(rec)){
			rec.forEach(function(r){
				r = dbutils.normatizeObject(r);
				validate(r);
			})
		} else{
			rec = dbutils.normatizeObject(rec);
			validate(rec);
		}
		return rec;
	},

	getKeys: function(model){
		return model.fields.filter(function(f){ return f.key });
	},

	getDataset: function(fields, rec, useDefaults){
		var dataset = {fields:[], values: []};
		var keys = Object.keys(rec);
		fields.forEach(function(f){
			k = keys.filter(function(k){ return k.toLowerCase() == (f.name + "").toLowerCase()});
			if (k.length == 0 && !f.readOnly){
				dataset.fields.push(f.name);
				if (useDefaults && f.default !== undefined){
					if (f.dataType == "bool" && typeof f.default == "boolean")
						f.default = f.default ? 'T' : 'F';
					dataset.values.push(f.default);
				} else
					dataset.values.push(null);
			} else if (!f.readOnly) {
				var value = rec[k[0]];
				if (f.required && (value === null || value === undefined)){
					dataset.errorMsg = 'Field "' + f.name + '" is required.';
					return
				} else if (!(value === null || value === undefined)){
					if (f.dataType == "integer"){
						if (isNaN(value) || !Number.isInteger(Number(value))){
							dataset.errorMsg = 'Invalid integer value (' + value + ') for field "' + f.name + '."';
							dataset.errorField = f.name;
							dataset.errorDataType = f.dataType;
							dataset.errorValue = value;
							return
						}
					} else if (f.dataType == "float") {
						if (isNaN(value)){
							dataset.errorMsg = 'Invalid float value (' + value + ') for field "' + f.name + '."';
							dataset.errorField = f.name;
							dataset.errorDataType = f.dataType;
							dataset.errorValue = value;
							return
						}
					} else if (f.dataType == "date" || f.dataType == "time" || f.dataType == "datetime") {
						var d = new Date(value);
						if (isNaN(d.getTime())){
							dataset.errorMsg =  'Invalid datetime value for field "' + f.name + '."';
							dataset.errorField = f.name;
							dataset.errorDataType = f.dataType;
							dataset.errorValue = value;
							return
						}
					} else if (f.dataType == "bool") {
						if (typeof(value) == "boolean"){
							value = value ? 'T' : 'F';
						} else if (value != "T" && value != "F"){
							dataset.errorMsg = 'Invalid bool value (' + value + ') for field "' + f.name + '."';
							dataset.errorField = f.name;
							dataset.errorDataType = f.dataType;
							dataset.errorValue = value;
							return
						}
					} else if (f.dataType != "string")
						throw 'Field "' + f.name + '" has an invalid data type.';
				}
				dataset.fields.push(f.name);
				dataset.values.push(value);
			}
		});
		var notFound = keys.filter(function(k){
			return fields.filter(function(f){ return f.name.toLowerCase() == k.toLowerCase() }).length == 0;
		});

		if (!dataset.errorMsg && notFound.length > 0){
			var err = "";
			notFound.forEach(function(n){
				err += (err ? ", " : "") + "'" + n + "'";
			});
			throw "Field(s) not found in model: " + err;
		}

		dataset.setValue = function(field, value){
			if (!field)	throw 'Invalid field.';
			var found = false;
			for (var i = 0; i < this.fields.length; i++) {
				if (this.fields[i].toLowerCase() == field.toLowerCase()){
					this.values[i] = value;
					found = true;
				}
			}
			if (!found){
				this.fields.push(field);
				this.values.push(value);
			}
		};

		dataset.getValue = function(field){
			if (!field)	throw 'Invalid field.';
			for (var i = 0; i < this.fields.length; i++) {
				if (this.fields[i].toLowerCase() == field.toLowerCase())
					return this.values[i];
			}
		};

		dataset.getRecord = function(fields){
			var dataset = this;
			var record = {};
			if (!!fields){
				fields.forEach(function(f){
					if (f.name.toLowerCase() != config.account_field.toLowerCase())
						var v = dataset.getValue(f.name);
						if (v !== null && v !== undefined)
							record[f.name] = v;
				})
			} else
				for (var i = 0; i < this.fields.length; i++)
					record[this.fields[i]] = this.values[i];
			return record;
		};
		return dataset;
	},


}


