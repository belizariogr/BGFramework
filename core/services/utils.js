'use strict'

module.exports = {

	setPropValue: function(obj, prop, value) {
	    if (typeof prop === "string")
	        prop = prop.split(".");

	    if (prop.length > 1) {
	        var e = prop.shift();
	        setPropValue(obj[e] = Object.prototype.toString.call(obj[e]) === "[object Object]" ? obj[e] : {}, prop, value);
	    } else
	        obj[prop[0]] = value;
	},
}


