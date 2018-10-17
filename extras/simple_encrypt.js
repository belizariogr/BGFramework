"use strict";

class SimpleEncrypt {

	static encrypt(str) {
		var r = "";
		for(var i = 0; i < str.length; i++){
			var l = str.charCodeAt(i);
			l = l + 21;
			if (l > 255)
				l = l - 256;
			r += String.fromCharCode(l);
		}
		return r;
	}

	static decrypt(str) {
		var r = "";
		for(var i = 0; i < str.length; i++){
			var l = str.charCodeAt(i);
			l = l - 21;
			if (l < 0)
				l = 256 + l;
			r += String.fromCharCode(l);
		}
		return r;
	}

}

module.exports = SimpleEncrypt;