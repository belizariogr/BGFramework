"use strict";

class Model {

	constructor(server) {
		this.server = server;
		this.resource = "";
		this.fields = [];
	}

	async get(req, res, listing) {
		try{
			let conditions = DBUtils.getConditions(this.server.config, this, req.query, req.params);
			let orders = DBUtils.getOrders(this.server.config, this, req.query);
			let page = DBUtils.getPage(req.query);
			let result = await this.server.db.get(this, conditions, orders, page, listing);
			res.json(result);
		} catch(err){
			if (!!this.server.config.debug)
				console.log(err);
			res.status(500).send('Cannot GET: ' + err);
		}
	}

	async list(req, res) {
		this.get(req, res, true);
	}

	async record(req, res) {
		this.get(req, res);
	}

	async insert(req, res, before, after) {
		try{
			let rec = DBUtils.validateRecord('insert', this, req.body);
			let dataset = DBUtils.getDataSet(this.server.config, this.fields, rec, true);
			if (dataset.errorMsg)
				return res.status(500).json({type: 1, error: "" + dataset.errorMsg, dataType: dataset.errorDataType, field: dataset.errorField, value: dataset.errorValue});
			if (!!before){
				try{
					before(rec);
				}catch(err){
					return res.status(500).json({type: 1, error: err});
				}
			}
			var result = await this.server.db.insert(this, dataset);
			if (!!after)
				after(rec);
			res.json(result);
		} catch(err){
			if (!!this.server.config.debug)
				console.log(err);
			res.status(500).send('Cannot POST: ' + err);
		}	
	}

	async update(req, res, before, after) {
		try{
			if (!!req.params && Object.keys(req.params).length > 0 && !!this.server.config.accountField)
				req.params[this.server.config.accountField] = req.token_obj.Account;
			var rec = DBUtils.validateRecord('update', this, req.body, req.params);
			var dataset = DBUtils.getDataSet(this.server.config, this.fields, rec);
			if (dataset.errorMsg)
				return res.status(500).json({type: 1, error: "" + dataset.errorMsg, dataType: dataset.errorDataType, field: dataset.errorField, value: dataset.errorValue});
			if (!!before){
				try{
					before(rec);
				}catch(err){
					return res.status(500).json({type: 1, error: err});
				}
			}
			var result = await this.server.db.update(this, dataset);
			if (!!after)
				after(rec);
			res.json(result);
		} catch(err){
			if (!!this.server.config.debug)
				console.log(err);
			res.status(500).send('Cannot PUT: ' + err);
		}
	}

	async delete(req, res, before, after) {
		try{
			if (!!req.params && Object.keys(req.params).length > 0){
				if (!!this.server.config.accountField)
					req.params[this.server.config.accountField] = req.token_obj.Account;
				var rec = DBUtils.validateRecord('delete', this, req.params);
			} else if (req.body)
				var rec = DBUtils.validateRecord('delete', this, req.body);

			if (!Array.isArray(rec))
				rec = [rec];

			for (var i = 0; i < rec.length; i++){
				var r = rec[i];
				var dataset = DBUtils.getDataSet(this.server.config, this.fields, r);
				if (dataset.errorMsg)
					throw {type: 1, error: "" + dataset.errorMsg, dataType: dataset.errorDataType, field: dataset.errorField, value: dataset.errorValue};
				if (!!before){
					try{
						before(r);
					}catch(err){
						throw {type: 1, error: err}
					}
				}
				var result = await this.server.db.delete(this, dataset);
				if (result.error)
					throw result.error;
				if (!!after)
					after(r);
			}
			res.json({iat: new Date().getTime()});
		} catch(err){
			if (!!this.server.config.debug)
				console.log(err);
			if (typeof err == "object")
				res.status(500).json(err);
			else
				res.status(500).send('Cannot DELETE: ' + err);
		}
	}
}

module.exports = Model;