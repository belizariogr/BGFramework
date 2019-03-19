"use strict";

class SQLHelper {

	static getFields(db, model, isList) {
		let fields = "";
		model.fields.forEach(f => {
			let code;
			if (typeof f.code == "string")
				code = f.code;
			else if (typeof f.code == "function")
				code = f.code(db);
			if (!f.hidden && (!isList || (isList && (f.list || f.list === undefined)))){
				if (f.dataType == "date")
					fields += (fields == "" ? "" : ", ") +  db.dateFormat((code || db.escapeField(f.origin, f.alias || f.resource) || db.escapeField(f.name, f.alias || f.resource))) + ' "' + f.name + '"';
				else if (f.dataType == "time")
					fields += (fields == "" ? "" : ", ") +  db.timeFormat((code || db.escapeField(f.origin, f.alias || f.resource) || db.escapeField(f.name, f.alias || f.resource))) + ' "' + f.name + '"';
				else if (f.dataType == "datetime")
					fields += (fields == "" ? "" : ", ") +  db.datetimeFormat((code || db.escapeField(f.origin, f.alias || f.resource) || db.escapeField(f.name, f.alias || f.resource))) + ' "' + f.name + '"';
				else
					fields += (fields == "" ? "" : ", ") + (code || db.escapeField(f.origin, f.alias || f.resource) || db.escapeField(f.name, f.alias || f.resource)) + ' "' + f.name + '"';
			}
		});
		return fields;
	}

	static getJoins(db, model, isList) {
		if (model.joins === undefined)
			return "";
		let joins = "";
		model.joins.forEach(j => joins += (j.type || "LEFT") + " JOIN " + j.resource + " " + j.alias + " ON (" + j.condition + ") ");
		return joins;
	}

	static prepareConditions(db, model, conditions) {
		var c = DBUtils.getDeletionField(model);
		if (!!c)
			conditions.push({
				resource: model.alias || model.resource,
				field: c.name,
				isNull: true
			});
		return conditions;
	}

	static getWhere(db, conditions) {
		var where = "";
		var orBlock = false;
		conditions.forEach(c => {
			if (c.isNull)
				where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + db.escapeField(c.field, c.resource) + " IS NULL";
			else if (c.isNotNull)
				where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + db.escapeField(c.field, c.resource) + " IS NOT NULL";
			else if (c.dataType == "date") {
				if (c.valueEnd)
					where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "CAST(" + db.escapeField(c.field, c.resource) + " AS DATE) BETWEEN " + db.escape(c.value) + " AND " + db.escape(c.valueEnd);
				else
					where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "CAST(" + db.escapeField(c.field, c.resource) + " AS DATE) = " + db.escape(c.value);
				if (c.startOr)
					orBlock = true;
				if (c.endOr) {
					where += ")";
					orBlock = false;
				}
			} else if (c.dataType == "timestamp") {
				if (c.valueEnd)
					where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "CAST(" + db.escapeField(c.field, c.resource) + " AS TIMESTAMP) BETWEEN " + db.escape(c.value) + " AND " + db.escape(c.valueEnd);
				else
					where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "CAST(" + db.escapeField(c.field, c.resource) + " AS TIMESTAMP) = " + db.escape(c.value);
				if (c.startOr)
					orBlock = true;
				if (c.endOr) {
					where += ")";
					orBlock = false;
				}
			} else if (c.dataType == "integer" || c.dataType == "numeric") {
				if (c.valueEnd)
					where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + db.escapeField(c.field, c.resource) + " BETWEEN " + c.value + " AND " + c.valueEnd;
				else
					where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + db.escapeField(c.field, c.resource) + " = " + c.value;
				if (c.startOr)
					orBlock = true;
				if (c.endOr) {
					where += ")";
					orBlock = false;
				}
			} else if (c.options || c.dataType == "bool") {
				where += (!where ? "" : " AND ") + db.escapeField(c.field, c.resource) + " IN (";
				var ins = '';
				c.value.forEach(v => ins += (ins ? ', ' : '') + db.escape(v));
				where += ins + ")";
			} else if (c.contains) {
				c.value = "%" + c.value.replace(" ", "%") + "%";
				where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + "LOWER(" + db.escapeField(c.field, c.resource) + ") LIKE LOWER(" + db.escape(c.value) + ")";
				if (c.startOr)
					orBlock = true;
				if (c.endOr) {
					where += ")";
					orBlock = false;
				}
			} else {
				where += (!where ? "" : (orBlock ? " OR " : " AND ")) + (c.startOr ? "(" : "") + db.escapeField(c.field, c.resource) + " = " + db.escape(c.value);
				if (c.startOr)
					orBlock = true;
				if (c.endOr) {
					where += ")";
					orBlock = false;
				}
			}
		});
		if (where)
			where = 'WHERE ' + where;
		return where;
	}

	static getOrderBy(db, orders) {
		if (!orders)
			return;
		var orderby = "";
		orders.forEach(o => orderby += (!!orderby ? ", " : "") + db.escapeField(o.field, o.alias || o.resource) + (!!o.sort ? " " + o.sort : ""));
		if (orderby)
			orderby = " ORDER BY " + orderby;
		return orderby;
	}

	static getCount(db, table, alias, where) {
		return "SELECT count(*) \"count\" FROM " +  db.escapeTable(table, alias) +  " " + where;
	}

	static getInsert(db, dataset, model) {
		var sql = "INSERT INTO " + model.resource + " (";
		var ins = "";
		var vals = "";
		dataset.fields.forEach(f => {
			ins += (!ins ? "" : ", ") + db.escapeField(f);
			vals += (!vals ? "" : ", ") + '?';
		});
		sql += ins + ") VALUES (" + vals + ")";
		return sql;
	}

	static getUpdate(db, dataset, model) {
		let sql = "UPDATE " + model.resource + " SET ";
		let d = DBUtils.getDeletionField(model);
		let upd = "";
		let whr = "";
		dataset.fields.forEach(f => upd += (!upd ? "" : ", ") + db.escapeField(f) + " = ? ");
		sql += upd + " WHERE";
		let keys = DBUtils.getKeys(model);
		keys.forEach(k => whr += (!whr ? " (" : " AND (") + db.escapeField(k.name) + " = " + db.escape(dataset.getValue(k.name)) + ")");
		if (!!d)
			whr += (!whr ? " (" : " AND (") + model.resource + "." + d.name + " IS NULL)";
		sql += whr;
		return sql;
	}

	static getDelete(db, dataset, model) {
		let sql;
		let d = DBUtils.getDeletionField(model);
		if (!!d)
			sql = 'UPDATE ' + model.resource + ' SET ' + d.name + ' = "' + db.formatDateTime(new Date(), true) + '"';
		else
			sql = "DELETE FROM " + model.resource;
		let whr = "";
		let keys = DBUtils.getKeys(model);
		keys.forEach(k => whr += (!whr ? " (" : " AND (") + db.escapeField(k.name) + " = " + db.escape(dataset.getValue(k.name)) + ")");
		if (!!d)
			whr += (!whr ? " (" : " AND (") + model.resource + "." + d.name + " IS NULL)";
		sql += " WHERE " + whr;
		return sql;
	}

	static async get(db, model, conditions, orders, page, listing) {
		let pageRecords = Math.trunc(model.pageRecords || db.server.config.pageRecords);
		pageRecords = pageRecords < 1 ? 1 : pageRecords;
		let recCount = 0;
		let fields = this.getFields(db, model, listing);
		let joins = this.getJoins(db, model, listing);
		let cond = this.prepareConditions(db, model, conditions);
		let where = this.getWhere(db, cond);
		let orderby = this.getOrderBy(db, orders);
		let sql = db.getSelectSQL(model.resource, model.alias, joins, fields, where, "", orderby, page, pageRecords);
		if (typeof page == "number" && page > 0) {
			recCount = await db.query(this.getCount(db, model.resource, model.alias, where));
			if (recCount.error)
				throw recCount.error;
			recCount = recCount.rows[0].count;
		};
		let pageCount = Math.trunc(recCount / pageRecords) + (recCount % pageRecords == 0 ? 0 : 1);
		let result = await db.query(sql);
		if (result.error)
			throw result.error;
		if (page)
			return {
				iat: new Date().getTime(),
				page: page,
				pagecount: pageCount,
				pagerecods: pageRecords,
				records: recCount,
				rows: result.rows
			};
		else
			return {
				iat: new Date().getTime(),
				rows: result.rows
			};
	}

	static async insert(db, model, dataset) {
		var autoIncField = DBUtils.getAutoIncFieldName(model);
		if (!!autoIncField) {
			var r = await db.getAutoInc(dataset.getValue(db.server.config.systemUserField), model.resource);
			if (r.error)
				throw r.error;
			dataset.setValue(autoIncField, r);
		}
		let creationField = DBUtils.getCreationField(model);
		if (!!creationField)
			dataset.setValue(creationField.name, db.formatDateTime(new Date(), true));
		let modificationField = DBUtils.getModificationField(model);
		if (!!modificationField)
			dataset.setValue(modificationField.name, db.formatDateTime(new Date(), true));
		let sql = this.getInsert(db, dataset, model);
		let res = await db.query(sql, dataset.values);
		if (res.error)
			throw res.error;
		return {
			iat: new Date().getTime(),
			id: r
		};
	}

	static async update(db, model, dataset) {
		let creationField = DBUtils.getCreationField(model);
		if (!!creationField)
			dataset.deleteValue(creationField.name);
		let deletionField = DBUtils.getDeletionField(model);
		if (!!deletionField)
			dataset.deleteValue(deletionField.name);
		let modificationField = DBUtils.getModificationField(model);
		if (!!modificationField)
			dataset.setValue(modificationField.name, db.formatDateTime(new Date(), true));
		let res = await db.query(this.getUpdate(db, dataset, model), dataset.values);
		if (res.error)
			throw res.error;
		return {
			iat: new Date().getTime()
		};
	}

	static async delete(db, model, dataset) {
		let res = await db.query(this.getDelete(db, dataset, model), dataset.values);
		if (res.error)
			throw res.error;
		return {
			iat: new Date().getTime()
		};
	}
}

module.exports = SQLHelper;