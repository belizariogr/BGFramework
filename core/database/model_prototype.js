module.exports = function(){
	this.resource = "";
	this.fields = [];

	this.get = async function(req, res){
		try{
			var conditions = dbutils.getConditions(this, req.query, req.params);
			var orders = dbutils.getOrders(this, req.query);
			var page = dbutils.getPage(req.query);
			var result = await db_conn.list(this, conditions, orders, page);
			res.json(result);
		} catch(err){
			if (!!config.debug)
				console.log(err);
			res.status(500).send('Cannot GET: ' + err);
		}
	};

	this.insert = async function(req, res, before, after){
		try{			
			var rec = dbutils.validateRecord('insert', this, req.body);			
			var dataset = dbutils.getDataset(this.fields, rec, true);			
			if (dataset.errorMsg)
				return res.status(500).json({type: 1, error: "" + dataset.errorMsg, dataType: dataset.errorDataType, field: dataset.errorField, value: dataset.errorValue});			
			if (!!before){
				try{
					before(rec);
				}catch(err){
					return res.status(500).json({type: 1, error: err});
				}
			}		
			var result = await db_conn.insert(this, dataset);
			if (!!after)
				after(rec);
			res.json(result);			
		} catch(err){
			if (!!config.debug)
				console.log(err);
			res.status(500).send('Cannot POST: ' + err);
		}
	};

	this.update = async function(req, res, before, after){
		try{			
			var rec = dbutils.validateRecord('update', this, req.body);			
			var dataset = dbutils.getDataset(this.fields, rec);				
			if (dataset.errorMsg)
				return res.status(500).json({type: 1, error: "" + dataset.errorMsg, dataType: dataset.errorDataType, field: dataset.errorField, value: dataset.errorValue});			
			if (!!before){
				try{
					before(rec);
				}catch(err){
					return res.status(500).json({type: 1, error: err});
				}
			}		
			var result = await db_conn.update(this, dataset);
			if (!!after)
				after(rec);
			res.json(result);			
		} catch(err){
			if (!!config.debug)
				console.log(err);
			res.status(500).send('Cannot PUT: ' + err);
		}
	};

	this.delete = async function(req, res, before, after){
		try{			
			var rec = dbutils.validateRecord('delete', this, req.body);			
			var dataset = dbutils.getDataset(this.fields, rec);			
			if (dataset.errorMsg)
				return res.status(500).json({type: 1, error: "" + dataset.errorMsg, dataType: dataset.errorDataType, field: dataset.errorField, value: dataset.errorValue});			
			if (!!before){
				try{
					before(rec);
				}catch(err){
					return res.status(500).json({type: 1, error: err});
				}
			}		
			var result = await db_conn.delete(this, dataset);
			if (!!after)
				after(rec);
			res.json(result);			
		} catch(err){
			if (!!config.debug)
				console.log(err);
			res.status(500).send('Cannot DELETE: ' + err);
		}
	};
}