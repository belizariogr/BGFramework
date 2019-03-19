"use strict";

class Model {

	constructor(server) {
		this.server = server;
		this.resource = "";
		this.fields = [];
	}

	addOrder(field, sort) {
		if (this.orders === undefined)
			this.orders = [];
		this.orders.push({field: field.name, sort: sort || ""});
	}

	async get(req, res, before, listing) {
		try{
			let conditions = DBUtils.getConditions(this.server.config, this, req.query, req.params);
			let orders = DBUtils.getOrders(this.server.config, this, req.query);
			if (orders.length == 0)
				orders = this.orders || orders;
			let page = DBUtils.getPage(req.query);
			var result = await this.server.db.get(this, conditions, orders, page, listing);
			await before(result, this.server.db, req.token_obj.Id, conditions, req, res);
			res.json(result);
		} catch(err){
			if (!!this.server.config.debug)
				console.log(err);
			if (typeof err == "object")
				res.status(500).json(err);
			else
				res.status(500).send('Cannot GET: ' + err);
		}
	}

	async list(req, res, before) {
		this.get(req, res, before, true);
	}

	async record(req, res, before) {
		this.get(req, res, before);
	}

	async insert(req, res, before, after) {
		try{
			let helper = {};
			let rec = DBUtils.validateRecord('insert', this, req.body);
			let dataset = DBUtils.getDataSet(this, this.server.config, rec, true);
			try{
				await before(rec, dataset, this.server.db, helper);
			}catch(err){
				return res.status(500).json({type: 1, error: err});
			}
			var result = await this.server.db.insert(this, dataset);
			after(rec, dataset, this.server.db, helper);
			res.json(result);
		} catch(err){
			if (!!this.server.config.debug)
				console.log(err);
			if (typeof err == "object")
				res.status(500).json(err);
			else
				res.status(500).send('Cannot POST: ' + err);
		}
	}

	async update(req, res, before, after) {
		try{
			if (!!req.params && Object.keys(req.params).length > 0 && !!this.server.config.systemUserField)
				req.params[this.server.config.systemUserField] = req.token_obj.Id;
			let helper = {};
			var rec = DBUtils.validateRecord('update', this, req.body, req.params);
			var dataset = DBUtils.getDataSet(this, this.server.config, rec);
			try{
				await before(rec, dataset, this.server.db, helper);
			}catch(err){
				return res.status(500).json({type: 1, error: err});
			}
			var result = await this.server.db.update(this, dataset);
			after(rec, dataset, this.server.db, helper);
			res.json(result);
		} catch(err){
			if (!!this.server.config.debug)
				console.log(err);
			if (typeof err == "object")
				res.status(500).json(err);
			else
				res.status(500).send('Cannot PUT: ' + err);
		}
	}

	async delete(req, res, before, after) {
		try{
			if (!!req.params && Object.keys(req.params).length > 0){
				if (!!this.server.config.systemUserField)
					req.params[this.server.config.systemUserField] = req.token_obj.Id;
				var rec = DBUtils.validateRecord('delete', this, req.params);
			} else if (req.body)
				var rec = DBUtils.validateRecord('delete', this, req.body);
			if (!Array.isArray(rec))
				rec = [rec];
			for (var i = 0; i < rec.length; i++){
				var r = rec[i];
				let helper = {};
				var dataset = DBUtils.getDataSet(this, this.server.config, r, false, true);
				try{
					await before(r, dataset, this.server.db, helper);
				}catch(err){
					throw {type: 1, error: err}
				}
				var result = await this.server.db.delete(this, dataset);
				if (result.error)
					throw result.error;
				after(r, dataset, this.server.db, helper);
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