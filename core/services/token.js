'use strict';

class TokenService {

	constructor(config) {
		this.SECRET_KEY = config.jwtPassword;
		this.expiration = config.jwtExpiration;
		this.jwt = require('jsonwebtoken');
	}

	get(object) {
		return this.jwt.sign(object, this.SECRET_KEY, { expiresIn: this.expiration * 60 });
	}

	verify(token) {				
		let d = this.jwt.verify(token, this.SECRET_KEY);				
		if (!d.Account || !d.Id)
			return false;
		return d;
	}

	decode(token) {
		return this.jwt.decode(token);
	}

	login(id, account, accountType, userRights) {
		return {
			iat: new Date().getTime(),
			token: this.get({
				Id: id,
				Account: account,
				AccountType: accountType,
				UserRights: userRights
			}),
			expiration: new Date().getTime() + this.expiration * 60 * 1000
		};
	}

}
 
global.TokenService = TokenService;