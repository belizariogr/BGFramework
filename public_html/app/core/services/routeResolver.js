'use strict'

angular.module('routeResolverService', []).provider('routeResolver', function(){

	this.$get = function(){
		return this;
	};

	this.routeConfig = function() {
		var resDirectory            = 'resources/',
			coreControllersDirectory = 'app/core/controllers/',

		setResDirectory = function(resDir){
			resDirectory = resDir;
		},

		getResDirectory = function(){
			return resDirectory;
		},

		getCoreControllersDirectory = function(){
			return coreControllersDirectory;
		}

		return {
			setResDirectory: setResDirectory,
			getResDirectory: getResDirectory,
			getCoreControllersDirectory: getCoreControllersDirectory
		};

	}();

	this.route = function(routeConfig){
		var resolve = function(name, secure, isCore, res, load, check){
			var routeDef = {};
			var resControllerFullPath = '';
			var resPath = '';
			var resViewFullPath = '';
			if (name == 'logout'){
				resControllerFullPath = 'app/core/controllers/logout.js';
			}
			else {
				resPath = routeConfig.getResDirectory() + name + '/';
				resControllerFullPath = resPath + 'controller.js';
				routeDef.templateUrl = resPath + 'view.html';
				routeDef.css = resPath + 'style.css';
				routeDef.secure = (secure) ? secure : false;
			}

			routeDef.resolve = {
				load: function($location, $q, $rootScope){
					load($location);
					var dependencies = [resControllerFullPath];
					return resolveDependencies($q, $rootScope, dependencies);
				},
				check: check
			};
			return routeDef;
		},

		resolveDependencies = function($q, $rootScope, dependences){
			var defer = $q.defer();
			requires(dependences, function(){
				defer.resolve();
				if(!$rootScope.$$phase)
					$rootScope.$apply()
			});
			return defer.promise;
		};

		return {
			resolve: resolve
		}
	}(this.routeConfig);
});