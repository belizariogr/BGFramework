'use strict'

module.exports = {

	setup: function(config){
		this.SECRET_KEY = config.jwt_password;
		this.expiration = config.jwt_expiration;

		this.jwt = require('jsonwebtoken');
	},

	get: function(object){
		return this.jwt.sign(object, this.SECRET_KEY, { expiresIn: this.expiration * 60 });
	},

	verify: function(token){
		var d = this.jwt.verify(token, this.SECRET_KEY);
		if (!d.Account || !d.Id) {
			return false;
		}
		return d;
	},

	decode: function(token){
		return this.jwt.decode(token);
	},

	login: function(id, account, accountType, userRights) {
		return { 
			acess_token: token_service.get({
				Id: id,
				Account: account,
				AccountType: accountType,
				UserRights: userRights
			}),
			expiration: new Date().getTime() + token_service.expiration * 60 * 1000
		};
	},
}



