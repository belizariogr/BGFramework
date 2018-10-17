"use strict";

class DataSet {

	constructor(config){
		this.config = config;
		this.fields = [];
		this.values = [];

	};

	setValue(field, value) {
		if (!field)	
			throw 'Invalid field.';
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

	getValue(field) {
		if (!field)	
			throw 'Invalid field.';
		for (var i = 0; i < this.fields.length; i++) {
			if (this.fields[i].toLowerCase() == field.toLowerCase())
				return this.values[i];
		}
	};

	getRecord(fields) {
		var record = {};
		if (!!fields){
			fields.forEach(f => {
				if (f.name.toLowerCase() != this.config.accountField.toLowerCase())
					var v = this.getValue(f.name);
					if (v !== null && v !== undefined)
						record[f.name] = v;
			});
		} else
			for (var i = 0; i < this.fields.length; i++)
				record[this.fields[i]] = this.values[i];
		return record;
	};
}

module.exports = DataSet;