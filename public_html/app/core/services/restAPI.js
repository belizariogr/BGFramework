'use strict'

angular.module('restAPIService', []).provider('restAPI', function(){

	this.http = null;
	this.$get = () => this;
	this.apiAddress = '';

	this.config = (appConfig, $http) => {
		this.appConfig = appConfig;
		this.apiAddress = appConfig.apiAddress;
		this.http = $http;
	}

	var composeUrl = (apiAddress, resource, isPublic, page, orderField, sort, others) => {
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

		return apiAddress + '/api/' + (isPublic ? '' : 'v1/') + resource + q;
	}

	var getHeaders = isPublic => {
		var h = {'Content-Type': 'application/json;charset=utf-8'};
		if (!isPublic)
			h.Authorization = 'Bearer ' + localStorage.getItem("token")
		return h;
	}

	this.get = (resource, isPublic, page, orderField, sort, others) => {
		return this.http({
			method: 'GET',
			url: composeUrl(this.apiAddress, resource, isPublic, page, orderField, sort, others),
			headers: getHeaders(isPublic),
			timeout: this.appConfig.apiTimeout || 15000
		});
	};

	this.post = (resource, isPublic, data) => {
		if (!isPublic) {
			return this.http({
				method: 'POST',
				url: composeUrl(this.apiAddress, resource, isPublic),
				headers: getHeaders(isPublic),
				timeout: this.appConfig.apiTimeout || 15000,
				data: data
			});
		}
		else{
			return this.http.post(this.apiAddress + '/api/' + resource, data);
		}
	};

	this.put = (resource, isPublic, data) => {
		return this.http({
			method: 'PUT',
			url: composeUrl(this.apiAddress, resource, isPublic),
			headers: getHeaders(isPublic),
			timeout: this.appConfig.apiTimeout || 15000,
			data: data
		});
	};

	this.delete = (resource, isPublic, data) => {
		return this.http({
			method: 'DELETE',
			url: composeUrl(this.apiAddress, resource, isPublic),
			headers: getHeaders(isPublic),
			timeout: this.appConfig.apiTimeout || 15000,
			data: data
		});
	};

});