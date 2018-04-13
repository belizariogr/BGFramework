'use strict'

var app = angular.module("loginApp");

app.controller('loginCtrl', ['$scope', '$http', '$window', function($scope, $http, $window){

	$scope.appConfig = app.appConfig;
	$scope.title = $scope.appConfig.appName + ' - Login';

	$scope.appName = (app.appConfig.logoType == 3 ? '' : ' ') + app.appConfig.appName;

	$scope.message = '';
	$scope.login_button_disabled = false;

	$scope.userData = {
		username: '',
		password: ''
	}

	var saveToken = function(token, expiration){
		localStorage.setItem("token", token);
		localStorage.setItem("expiration", expiration);
	}

	var clearData = function(){
		$scope.userData.username = '';
		$scope.userData.password = '';
	}

	$scope.login = function(){
		if (!$scope.userData.username || !$scope.userData.password){
			$scope.message = 'Usuário ou senha inválidos. Por favor, tente novamente.';
			$scope.invalidLogin = true;
			$scope.login_button_disabled = false;
			clearData();
		}
		else {
			$scope.login_button_disabled = true;
			$http.post(app.appConfig.backend_addr + '/api/login/', $scope.userData).then(
				function successCallback(res){
					if (res.data.acess_token) {
		    			$scope.invalidLogin = false;
		    			$scope.message = '';
		    			clearData();
		    			saveToken(res.data.acess_token, res.data.expiration);
		    			$window.open('/', '_self');
					}
					else {
						$scope.message = 'Usuário ou senha inválidos. Por favor, tente novamente.';
		    			$scope.invalidLogin = true;
		    			$scope.login_button_disabled = false;
		    			saveToken('');
		    			clearData();
					}

				},
				function errorCallback(res){
					$scope.message = 'Não foi possível efetuar o login. Tente novamente mais tarde.';
					$scope.login_button_disabled = false;
	    			$scope.invalidLogin = true;
	    			saveToken('');
	    			clearData();
				}
			);
		}
	};

}]);