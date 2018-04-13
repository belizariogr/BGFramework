var app = angular.module("loginApp", ['appConfigService']).config(['appConfigProvider', function(appConfigProvider){
	app.appConfig = appConfigProvider;
}]);