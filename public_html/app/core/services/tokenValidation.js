'use strict'

angular.module('tokenValidationService', []).provider('tokenValidation', function(){

	this.$get = () => this;
	this.validate = (restAPI, callback) => {
		var token = localStorage.getItem("token", token);
		var expiration = localStorage.getItem("expiration", expiration);
		var curTime = Math.trunc(new Date().getTime() / 1000);
		if (!token || !expiration || curTime > expiration){
			if (!!callback)
				callback('Not logged in.');
			return false
		}

		if (!!restAPI){
			restAPI.post('validatetoken', true, {token: token}).then(
				res => {
					if (!!res.data.error)
						callback(res.data.error);
					else
						callback();
				},
				err => 	callback(err)				
			);
		}
		if (!callback)
		 	return true;
	}
});
