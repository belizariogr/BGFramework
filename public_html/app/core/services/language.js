'use strict'

angular.module('languageService', []).provider('language', function(){

	var $this = this;
	this.http = null;

	this.$get = function() {
		return this;
	};

	this.l = {};
	this.langs = [];

	this.config = function(langList, currentLang){
		var list = [{code: "en-US", name: 'English (United States)'}];
		if (!!langList)
			list = langList;
		this.langs = list;
		this.setLang(currentLang || list[0].code);
	}

	this.indexOf = function(lang){
		for (var i = 0; i <= this.langs.length - 1; i++){
			if (this.langs[i].code.toLowerCase() == lang.toLowerCase())
				return i;
		}
		return -1;
	}

	this.setLang = function(lang, callback){
		if(this.currentLang == lang)
			return
		if (this.indexOf(lang) == -1)
			lang = this.langs[0].code;
		if (!!callback){
			localStorage.setItem("lang", lang)
			callback();
		}
		else {
			if (!this.http) {
				console.error("No HTTP for lang service.");
				return
			}

			this.http.get('lang/' + lang.toLowerCase() + '.lang.json').then(
				function successCallback(res){
					$this.l = res.data.values;
					$this.currentLang = res.data.code;

					$this.currentLangName = res.data.name;
					app.setTitle(app.currentResource);

				},
				function errorCallback(res){
					console.error("Cannot load language file.")
				}
			);
		}


	}

});