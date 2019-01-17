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
}

module.exports = Utils;