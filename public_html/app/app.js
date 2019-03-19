'use strict'

var app = angular.module("mainApp", ['ngSanitize', 'ngRoute', 'ngMask', 'angularCSS', 'appConfigService', 'routeResolverService', 'tokenValidationService', 
	'restAPIService', 'languageService', 'matchMedia', 'colorListService']);

app.config(['$compileProvider', '$controllerProvider', '$filterProvider', '$provide', 'languageProvider', 'colorListProvider',
			'$qProvider', '$httpProvider', '$routeProvider', 'routeResolverProvider', 'tokenValidationProvider', 'restAPIProvider', 'appConfigProvider',
			($compileProvider, $controllerProvider, $filterProvider, $provide, languageProvider, colorListProvider,
			 $qProvider, $httpProvider, $routeProvider, routeResolverProvider, tokenValidationProvider, restAPIProvider, appConfigProvider) => {
		app.register = {
			controller: $controllerProvider.register,
			directive:  $compileProvider.directive,
			filter:     $filterProvider.register,
			factory:    $provide.factory,
			service:    $provide.service
		};

		// Configure defaults providers
		$qProvider.errorOnUnhandledRejections(false);
		$httpProvider.defaults.cache = false;
		if (!$httpProvider.defaults.headers.get)
			$httpProvider.defaults.headers.get = {};
		$httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
		$httpProvider.interceptors.push(['$q', '$location', ($q, $location) => {
			return {
				'response': (response) => response,
				'responseError': (rejection) => {
					if(rejection.status === 401)
						$location.path('/logout');
					return $q.reject(rejection);
				}
			}
		}]);

		// Configure App providers
		var route = routeResolverProvider.route;
		app.appConfig = appConfigProvider;
		app.validateToken = tokenValidationProvider.validate;
		app.restAPI = restAPIProvider;
		app.lang = languageProvider;
		app.colorList = colorListProvider;

		// Configure Routes
		var routeLoad = $location => app.setCurrentResource($location.path());
		var routeCheck = () => {};
		app.appConfig.resources.forEach(r => {
			$routeProvider.when('/' + r.name, route.resolve(r.name, false, false, r, routeLoad, routeCheck));
			if (!r.modal)
				$routeProvider.when('/' + r.name + '/:id', route.resolve(r.name, false, false, r, routeLoad, routeCheck));
		});
		$routeProvider
			.when('/', route.resolve(app.appConfig.resources[0].name, false, false, false, routeLoad, routeCheck))
			.when('/logout', route.resolve('logout', false, false, false, routeLoad))
			.otherwise({ redirectTo: '/' });

		app.plugins = {
			menuButtons: [],
			appPlugins: []
		};

		app.appConfig.plugins.forEach(p => {
			require('plugins/' + p.name + '/plugin.js');
			if (p.type === 'menu-button')
				app.plugins.menuButtons.push(p.name)
			else
				app.plugins.appPlugins.push(p.name)
		});
	}
]);

app.run(['$window', '$rootScope', '$http', ($window, $rootScope, $http) => {
	app.restAPI.config(app.appConfig, $http);
	if (!app.validateToken()){
		$window.open('/login/', '_self');
		return
	};
	var token = localStorage.getItem("token", token);
	var t = token.split('.');
	try{
		var d = JSON.parse(atob(t[1]));
		$rootScope.User = d.user;
		$rootScope.UserType = d.UserType;
		$rootScope.LoginDate = new Date(d.iat * 1000);
	}catch(err){
		$window.open('/login/', '_self');
		return
	};
	app.lang.http = $http;
	var lang = $window.navigator.language || $window.navigator.userLanguage;
	lang = lang.toLowerCase();
	app.colorList.config(app.appConfig.colorList, app.appConfig.contrastColor, app.appConfig.borerContrastColor);
	app.lang.config(app.appConfig.languages, localStorage.getItem("lang") || lang || app.appConfig.languages[0].code);
	$rootScope.$on('$routeChangeStart', (evt, next, current) => {
		if ((window.innerWidth <= 768 || isMobileBrowser()) && $('.modal-backdrop').length){
			var btnClose = $('#editModal').find(".close");
			if (btnClose.click)
				btnClose.click();
			$('.modal').modal("hide");
			evt.preventDefault();
		}
	});
}]);