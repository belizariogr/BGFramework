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
		return d;
	}

	decode(token) {
		return this.jwt.decode(token);
	}

	login(id, user, userType, userRights) {
		return {
			iat: new Date().getTime(),
			token: this.get({
				Id: id,
				User: user,
				UserType: userType,
				UserRights: userRights
			}),
			expiration: new Date().getTime() + this.expiration * 60 * 1000
		};
	}

}
 
global.TokenService = TokenService;