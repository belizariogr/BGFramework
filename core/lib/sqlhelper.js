"use strict";

class SQLHelper {

	static getFields(model, isList) {	
		var fields = "";
		for (var i = 0; i < model.fields.length; i++){
			if (!model.fields[i].hidden && (!isList || (isList && (model.fields[i].list || model.fields[i].list === undefined)))) {
				fields += model.fields[i].name + ' "' + model.fields[i].name + '"';
				if (i !== model.fields.length - 1)
					fields += ",";
				fields += " ";
			}
		}
		return fields;
	}

	static getWhere(db, conditions) {
		var where = "";
		var orBlock = false;
		conditions.forEach(c => {
			if (c.dataType == "date"){
				if (c.valueEnd)
					where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "CAST(" + c.field + " AS DATE) BETWEEN " + db.escape(c.value) + " AND " + db.escape(c.valueEnd);
				else
					where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "CAST(" + c.field + " AS DATE) = " + db.escape(c.value);
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
				c.values.forEach(v => ins += (ins ? ', ' : '') + db.escape(v));
				where += ins + ")";
			} else if (c.contains){
				c.value = "%" + c.value.replace(" ", "%") + "%";
				where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "LOWER(" + c.field + ") LIKE LOWER(" + db.escape(c.value) + ")";
				if (c.startOr)
					orBlock = true;
				if(c.endOr){
					where += ")";
					orBlock = false;
				}
			} else {
				where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + c.field + " = " + db.escape(c.value);
				if (c.startOr)
					orBlock = true;
				if(c.endOr){
					where += ")";
					orBlock = false;
				}
			}
		});
		if (where)
			where = 'WHERE ' + where;
		return where;
	}

	static getOrderBy(orders) {
		if (!orders)
			return;
		var orderby = "";
		orders.forEach(o => orderby += (!!orderby ? ", " : "") + o.field + (!!o.sort ? " " + o.sort : ""));
		if (orderby)
			orderby = " ORDER BY " + orderby;
		return orderby;
	}

	static getCount(table, where) {
		return "SELECT count(*) \"count\" FROM " + table + " " + where;
	}

	static getInsert(dataset, model) {
		var sql = "INSERT INTO " + model.resource + " (";
		var ins = "";
		var vals = "";
		dataset.fields.forEach(f => {
			ins += (!ins ? "" : ", ") + f;
			vals += (!vals ? "" : ", ") + '?';
		});
		sql += ins + ") VALUES (" + vals + ")";
		return sql;
	}

	static getUpdate(db, dataset, model) {
		var sql = "UPDATE " + model.resource + " SET ";
		var upd = "";
		var whr = "";
		var vals = dataset.values;
		dataset.fields.forEach(f => upd += (!upd ? "" : ", ") + f + " = ? ");
		sql += upd + " WHERE";
		var keys = DBUtils.getKeys(model);
		keys.forEach(k => whr += (!whr ? " (" : " AND (") + k.name + " = " + db.escape(dataset.getValue(k.name)) + ")");
		sql += whr;
		return sql;
	}

	static getDelete (db, dataset, model){
		var sql = "DELETE FROM " + model.resource;
		var whr = "";
		var vals = [];
		var keys = DBUtils.getKeys(model);
		keys.forEach(k => whr += (!whr ? " (" : " AND (") + k.name + " = " + db.escape(dataset.getValue(k.name)) + ")");
		sql += " WHERE " + whr;
		return sql;
	}

	static async get(db, model, conditions, orders, page, listing){
		var fields = this.getFields(model, listing);
		var where = this.getWhere(db, conditions);
		var orderby = this.getOrderBy(orders);
		var sql = db.getSelectSQL(model.resource, fields, where, "", orderby, page);
		var recCount;
		if (typeof page == "number" && page > 0){
			recCount = await db.query(this.getCount(model.resource, where));
			if (recCount.error)
				throw recCount.error;
			recCount = recCount.rows[0].count;
		};
		var result = await db.query(sql);
		if (result.error)
			throw result.error;
		if (page)
			var dataset = {iat: new Date().getTime(), page: page, pagecount: Math.floor(recCount / db.server.config.page_records) + 1, rows: result.rows};
		else
			var dataset = {iat: new Date().getTime(), rows: result.rows};
		return dataset;
	}

	static async insert(db, model, dataset){
		var autoIncField = DBUtils.getAutoIncFieldName(model, dataset);
		if (!!autoIncField){
			var r = await db.getAutoInc(dataset.getValue(db.server.config.systemUserField), model.resource);
			if (r.error)
				throw r.error;
			dataset.setValue(autoIncField, r);
		}		
		var res = await db.query(this.getInsert(dataset, model), dataset.values);
		if (res.error)
			throw res.error;
		return {iat: new Date().getTime(), id: r};
	}

	static async update(db, model, dataset){
		var res = await db.query(this.getUpdate(db, dataset, model), dataset.values);
		if (res.error)
			throw res.error;
		return {iat: new Date().getTime()};
	}

	static async delete(db, model, dataset){
		var res = await db.query(this.getDelete(db, dataset, model), dataset.values);
		if (res.error)
			throw res.error;
		return {iat: new Date().getTime()};
	}

}


module.exports = SQLHelper;