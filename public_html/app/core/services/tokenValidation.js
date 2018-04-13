'use strict'

angular.module('tokenValidationService', []).provider('tokenValidation', function(){

	this.$get = function() {
		return this;
	};

	this.validate = function(restAPI, callback){
		var token = localStorage.getItem("token", token);
		var expiration = localStorage.getItem("expiration", expiration);
		var curTime = new Date().getTime();
		if (!token || !expiration || curTime > expiration){
			if (!!callback)
				callback('Not logged in.');
			return false
		}

		if (!!restAPI){
			restAPI.post('validatetoken', true, {token: token}).then(
				function(res){
					if (!!res.data.error)
						callback(res.data.error);
					else
						callback();
				},
				function(err){
					callback(err);
				}
			)
		}
		if (!callback)
		 	return true;
	}
});
