"use strict";

class DBUtils {
	
	static fieldByName(model, fieldName) {
		var field;
		model.fields.forEach(f => {
			if (f.name.toLowerCase() == fieldName.toLowerCase()){
				field = f;
				return;
			}
		});
		if (!!field)
			return field;
	};

	static getConditions(config, model, q, p) {
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
					if (fields[i].toLowerCase() == config.systemUserField.toLowerCase()){
						f = {name: config.systemUserField, dataType: "integer", key: true, alias: model.alias || model.resource};
					};
					if (!f)
						throw 'No field found for condition.';
					else if (!f.searchable && !f.key)
						throw 'Field ' + f.name + ' cant be used for conditions.';
					else {
						c++;
						var cond = {
							resource: f.alias || model.alias || model.resource,
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
							  	cond.value = params[prop];
							if (value.length == 2)
								cond.valueEnd = value[1];

							if (cond.dataType == "date"){
								var d = new Date(cond.value);
								if (isNaN(d.getTime()))
									throw 'Invalid date (' + cond.value + ') for condition: ' + cond.field;
								cond.value = d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate();
								if (cond.valueEnd){
									d = new Date(cond.valueEnd);
									if (isNaN(d.getTime()))
										throw 'Invalid date for condition: ' +  cond.field;
									cond.valueEnd = d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate();
								}
							} else if (cond.dataType == "integer" || cond.dataType == "numeric") {								
								if (isNaN(cond.value))
									throw 'Invalid number (' + cond.value + ') for condition: ' + cond.field;
								if (cond.valueEnd)
									if (isNaN(cond.valueEnd))
										throw 'Invalid end number (' + cond.endValue + ') for condition: ' + cond.field;
							} else if (cond.dataType == "bool") {																
								if (!(cond.value == '0' || cond.value == '1' || cond.value == '1|0' || cond.value == '0|1'))
									throw 'Invalid bool (' + value + ') for condition: ' + cond.field;
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
	};

	static getOrders(config, model, params) {
		var orders = [];
		if (!!params && !!params.order && typeof params.order == "string"){
			var fields = params.order.split("|");
			var sorts = [];
			if (!!params.sort && typeof params.sort == "string")
				sorts = params.sort.split("|");
			var c = 0;
			for (var i = 0; i < fields.length; i++){
				var f = this.fieldByName(model, fields[i]);
				if (fields[i].toLowerCase() == config.systemUserField.toLowerCase()){
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
	};

	static getPage(p) {
		let page = 0;
		if (!!p && !!p.page)
			page = parseInt(p.page);
		return page;
	};

	static getAutoIncFieldName(model) {
		let f = model.fields.filter(f => !!f.autoInc);
		if (f.length > 0)
			return f[0].name;
	};

	static getCreationField(model){
		let f = model.fields.filter(f => !!f.isCreationField);			
		if (f.length > 0)
			return f[0];
	}

	static getModificationField(model){
		let f = model.fields.filter(f => !!f.isModificationField);	
		if (f.length > 0)
			return f[0];
	}

	static getDeletionField(model){
		let f = model.fields.filter(f => !!f.isDeletionField);			
		if (f.length > 0)
			return f[0];
	};

	static getValueByIndex(row, index) {
		return row[Object.keys(row)[index]];
	};

	static normatizeObject(obj) {		
		let normatize = o => {
			let buf = {};
			for (var p in o)
				buf[p.toLowerCase()] = o[p];			
			return buf;
		};		
		if (Array.isArray(obj)) {
			let arr = [];
			obj.forEach(o => arr.push(normatize(o)));
			return arr;
		};
		if (typeof obj == "object")
			return normatize(obj);
		return obj;	
	};

	static validateRecord(action, model, record, params) {
		if (!!params) {
			var buf = Object.assign(record, params);
			var rec = this.normatizeObject(buf);
		} else
			var rec =  this.normatizeObject(record);
		if (!rec)
			throw 'You need to pass a valid record.';		
		var keys = this.getKeys(model);
		var validate = rec => {
			if (action.toLowerCase() == 'update' || action.toLowerCase() == 'delete'){
				if (!keys || !Array.isArray(keys) || keys.length == 0)
					throw 'No key fields.';
				keys.forEach(k => {
					var name = k.name.toLowerCase();
					if (!rec[name])
						throw 'No value for key.';
				});
			} else if (action.toLowerCase() == 'insert'){
				var f = model.fields.filter(f => !!f.autoInc);
				if (f.length > 1)
					throw 'Model has more than one auto incremet field.';
			}
		};		
		if (Array.isArray(rec)){
			rec.forEach(r => {
				r = this.normatizeObject(r);
				validate(r);
			})
		} else {
			rec = this.normatizeObject(rec);
			validate(rec);
		}
		return rec;
	};

	static getKeys(model) {
		return model.fields.filter(f => f.key);
	};

	static getDataSet(model, config, rec, useDefaults, deletion) {
		var dataSet = new DataSet(config);		
		var keys = Object.keys(rec);
		var errorCode = 0;
		model.fields.forEach(f => {
			let k = keys.filter(k => k.toLowerCase() == (f.name + "").toLowerCase());
			if (f.required)
				errorCode += 1;
			if (k.length == 0 && !f.readOnly && f.code === undefined && !deletion){
				if (f.required)					
					error(errorCode, 'Field "' + f.name + '" is required.');
				dataSet.fields.push(f.name);
				if (useDefaults && f.default !== undefined){
					if (f.dataType == "bool" && typeof f.default == "boolean")
						f.default = f.default ? 1 : 0;
					dataSet.values.push(f.default);
				} else
					dataSet.values.push(null);
			} else if (!f.readOnly && f.code === undefined) {				
				var value = rec[k[0]];				
				if (f.required && (value === null || value === undefined) && !deletion){					
					return dataSet.errorMsg = 'Field "' + f.name + '" is required.';
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
						if (value != 0 && value != 1){
							dataSet.errorMsg = 'Invalid bool value (' + value + ') for field "' + f.name + '."';
							dataSet.errorField = f.name;
							dataSet.errorDataType = f.dataType;
							dataSet.errorValue = value;
							return
						} 
					} else if (f.dataType == "string"){
						value = value + "";
						if (f.size > 0 && value.length > f.size){
							if (config.fieldOverflowAction == "trim")
								value = value.substring(0, f.size);
							else
								throw 'Field "' + f.name + '" is too large.';
						}
					} else
						throw 'Field "' + f.name + '" has an invalid data type.';
				}
				dataSet.fields.push(f.name);
				dataSet.values.push(value);
			}
		});

		let notFound = keys.filter(k => model.fields.filter(f => f.name.toLowerCase() == k.toLowerCase()).length == 0);
		if (!dataSet.errorMsg && notFound.length > 0){
			var err = "";
			notFound.forEach(n => {
				err += (err ? ", " : "") + "'" + n + "'";
			});
			throw "Field(s) not found in model: " + err;
		}				
		return dataSet;
	};
}

module.exports = DBUtils;