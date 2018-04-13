'use strict'

angular.module('restAPIService', []).provider('restAPI', function(){

	this.http = null;

	this.$get = function() {
		return this;
	};

	this.backend_addr = '';

	this.config = function(appConfig, $http){
		this.backend_addr = appConfig.backend_addr;
		this.http = $http;
	}

	var composeUrl = function(backend_addr, resource, isPublic, page, orderField, sort, others){
		var q = "";
		if (page)
			q = 'page=' + page;
		if (!!orderField)
			q += (q ? '&' : '') + 'order=' + orderField;
		if (!!sort)
			q += (q ? '&' : '') + 'sort=' + sort;
		if (!!others){			
			q += (q ? '&' : '') + others;
		}
		if (q)
			q = '?' + q;

		return backend_addr + '/api/' + (isPublic ? '' : 'v1/') + resource + q;
	}

	var getHeaders = function(isPublic){
		var h = {'Content-Type': 'application/json;charset=utf-8'};
		if (!isPublic)
			h.Authorization = 'Bearer ' + localStorage.getItem("token")
		return h;
	}

	this.get = function(resource, isPublic, page, orderField, sort, others){
		return this.http({
			method: 'GET',
			url: composeUrl(this.backend_addr, resource, isPublic, page, orderField, sort, others),
			headers: getHeaders(isPublic)
		});
	};

	this.post = function(resource, isPublic, data){
		if (!isPublic) {
			return this.http({
				method: 'POST',
				url: composeUrl(this.backend_addr, resource, isPublic),
				headers: getHeaders(isPublic),
				data: data
			});
		}
		else{
			return this.http.post(this.backend_addr + '/api/' + resource, data);
		}
	};

	this.put = function(resource, isPublic, data){
		return this.http({
			method: 'PUT',
			url: composeUrl(this.backend_addr, resource, isPublic),
			headers: getHeaders(isPublic),
			data: data
		});
	};

	this.delete = function(resource, isPublic, data){
		return this.http({
			method: 'DELETE',
			url: composeUrl(this.backend_addr, resource, isPublic),
			headers: getHeaders(isPublic),
			data: data
		});
	};

});