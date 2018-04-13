'use strict'

var app = angular.module("mainApp");
app.controller('homeCtrl', ['$scope', '$rootScope', '$window', '$location', function($scope, $rootScope, $window, $location){
	$scope.homeView = '';
	$scope.plugins = app.plugins;
	$scope.lang = app.lang;

	$scope.currentResource = {
		name: "",
		caption: "",
		icon: ""
	};

	app.currentResource = $scope.currentResource;
	app.setTitle = function(){
		if (!!$scope.lang.l["res_" + $scope.currentResource.name])
			$scope.appTitle = app.appConfig.appName + ' :: ' + $scope.lang.l["res_" + $scope.currentResource.name].name;
		else
			$scope.appTitle = app.appConfig.appName + ' :: ' + $scope.currentResource.caption;
	}

	$scope.changeLang = function(lang){
		app.lang.setLang(lang, function(){
			location.reload();
		});
	}

	$scope.isResourceActive = function(name){
		return name === $scope.currentResource.name
	}
	app.validateToken(app.restAPI, function(err){
		if (!!err)
			$location.path('/logout');
		else {
			$scope.homeView = '/app/core/views/home.html';
			$scope.msgBoxView = '/app/core/views/uiMessageBox.html';
		}
	});

	$scope.appConfig = app.appConfig;

	var resources = app.appConfig.resources;
	var groups = app.appConfig.menu_groups;
	$scope.menu = [];

	var curGroup = '';

	var getGroup = function(name){
		var group = null;

		$scope.menu.forEach(function(g){
			if (g.isGroup && g.name == name){
				group = g;
				return false;
			}
		});

		if (group == null) {
			var g_icon = "";
			var g_caption = "";
			groups.forEach(function(g){
				if (g.name == name){
					g_icon = g.icon;
					g_caption = g.caption;
				}
			});
			group = {name: name, caption: g_caption, icon: g_icon, active: false, isGroup: true, isOpen: false, items: []}
			$scope.menu.push(group);
		}
		return group;
	};

	resources.forEach(function(r){
		if (r.menu_group == '' || !r.menu_group)
			$scope.menu.push({name: r.name, caption: r.caption, icon: r.icon, active: false, isGroup: false});
		else {
			var group = getGroup(r.menu_group);
			group.items.push({name: r.name, caption: r.caption, icon: r.icon, active: false, isGroup: false});
		}
	});

	$scope.setCurrentResource = function(path){
		var p = path;
		if (path){
			p = path.split('/');
			p = '/' + p[1];
		}

		app.appConfig.resources.forEach(function(r){
			if (p === '/' + r.name || (p === '/' && r.name === app.appConfig.resources[0].name)){
				$scope.currentResource = {
					name: r.name,
					caption: r.caption,
					icon: r.icon
				};
				app.setTitle();
				$scope.menu.forEach(function(m){
					m.active = false;
					if (m.isGroup) {
						var isActive = false;
						m.items.forEach(function(s){
							s.active = false;
							if (s.name == $scope.currentResource.name) {
								s.active = true;
								isActive = true;
							}
						});
						if (isActive){
							m.isOpen = true
						}
					}
					else if (m.name == $scope.currentResource.name)
						m.active = true;
				});
			}

		});
	}
	app.setCurrentResource = $scope.setCurrentResource;
	$scope.showMessageBox = false;
	app.messageBox = function(msg){
		$scope.showMessageBox = !$scope.showMessageBox;
		$scope.messageBoxContent = msg;
	}
}]);