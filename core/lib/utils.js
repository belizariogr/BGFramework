"use strict";

class Utils {
	static setPropValue(obj, prop, value) {
		if (typeof prop === "string")
	        prop = prop.split(".");

	    if (prop.length > 1) {
	        var e = prop.shift();
	        setPropValue(obj[e] = Object.prototype.toString.call(obj[e]) === "[object Object]" ? obj[e] : {}, prop, value);
	    } else
	        obj[prop[0]] = value;
	}

	static getPropValue(obj, prop){
		var k = Object.keys(obj);
		var p = k.filter(f => f.toLowerCase() == prop.toLowerCase());
		if (Array.isArray(p) && p.length > 0)
			return obj[p[0]];
	}

	static twoDigits(d) {
    	if(0 <= d && d < 10)
    		return "0" + d.toString();
    	if(-10 < d && d < 0)
    		return "-0" + ( -1 * d).toString();
    	return d.toString();
	}

	static getDateFromString(val, type){
		let year = 0;
		let month = 0;
		let date = 1;
		let hh = 0;
		let mm = 0;
		let ss = 0;
		let zz = 0;
		type = type || "datetime";
		if (typeof val != "string")
			return;
		if (type == "date" && (val.length != 10 && val.length != 24))
			return;
		if (type == "datetime" && val.length != 24)
			return;
		if (type == "time" && (val.length != 8 && val.length != 24))
			return;

		var getValue = (p, s) => +val.substring(p - 1, p + s - 1);

		if (type == "date" || type == "datetime"){
			year = getValue(1, 4);
			month = getValue(6, 2);
			date = getValue(9, 2);
			if (isNaN(year) || isNaN(month) || isNaN(date) || year < 0 || month < 1 || month > 12 || date < 1 || date > 31)
				return
			if (month == 2) {
				if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0) && (date > 29))
					return;
				else if (date > 28)
					return;
			}
			if ((month == 4 || month == 6 || month == 9 || month == 11) && date > 30)
				return;
		}

		if ((type == "datetime" || type == "time") && val.length == 24){
			hh = getValue(12, 2);
			mm = getValue(15, 2);
			ss = getValue(18, 2);
			zz = getValue(21, 3);
		} else if (type == "time" && val.length == 8){
			hh = getValue(1, 2);
			mm = getValue(4, 2);
			ss = getValue(7, 2);
		}
		if (isNaN(hh) || isNaN(mm) || isNaN(ss) || isNaN(zz) || hh < 0 || hh > 24 || mm < 0 || mm > 59 || ss < 0 || ss > 59 || zz < 0 || zz > 999)
			return

		let d = new Date();
		d.setFullYear(year);
		d.setMonth(month - 1);
		d.setDate(date);
		d.setHours(hh);
		d.setMinutes(mm);
		d.setSeconds(ss);
		d.setMilliseconds(zz);
		return d;
	}

	static validateDate(val, type){
		return !!this.getDateFromString(val, type);
	}

	static formatDateTime(datetime, ms) {
		return datetime.getFullYear() + "-" + Utils.twoDigits(datetime.getMonth() + 1) + "-" + Utils.twoDigits(datetime.getDate()) + " " + Utils.twoDigits(datetime.getHours()) + ":" + Utils.twoDigits(datetime.getMinutes()) + ":" + Utils.twoDigits(datetime.getSeconds() + (ms ? "." + datetime.getMilliseconds() : ""));
	}

	static getISODate(val){
		return this.formatDateTime(this.getDateFromString(val), true).substring(0, 10);
	}

	static getISOTime(val){
		return this.formatDateTime(this.getDateFromString(val), true).slice(0, 11);
	}

	static getISODateTime(val, ms){
		return this.formatDateTime(this.getDateFromString(val, ms), true);
	}
}

module.exports = Utils;