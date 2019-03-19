'use strict';

var app = angular.module("mainApp");
app.controller('homeCtrl', ['$scope', '$rootScope', '$window', '$location', ($scope, $rootScope, $window, $location) => {
	$scope.homeView = '';
	$scope.plugins = app.plugins;
	$scope.lang = app.lang;

	$scope.currentResource = {
		name: "",
		caption: "",
		icon: "",
		iconClass: ""
	};

	app.currentResource = $scope.currentResource;
	app.setTitle = () => {
		if (!!$scope.lang.l["res_" + $scope.currentResource.name])
			$scope.appTitle = app.appConfig.appName + ' :: ' + $scope.lang.l["res_" + $scope.currentResource.name].name;
		else
			$scope.appTitle = app.appConfig.appName + ' :: ' + $scope.currentResource.caption;
	}

	$scope.changeLang = lang => app.lang.setLang(lang, () => location.reload());
	$scope.isResourceActive = name => name === $scope.currentResource.name;

	app.validateToken(app.restAPI, err => {
		if (!!err)
			$location.path('/logout');
		else {
			$scope.homeView = '/app/core/views/home.html';
			$scope.msgBoxView = '/app/core/views/uiMessageBox.html';
		}
	});

	$scope.appConfig = app.appConfig;

	var resources = app.appConfig.resources;
	var groups = app.appConfig.menuGroups;
	$scope.menu = [];
	var getGroup = name => {
		var group = null;

		$scope.menu.forEach(g => {
			if (g.isGroup && g.name == name){
				group = g;
				return false;
			}
		});

		if (group == null) {
			var g_icon = "";
			var g_caption = "";
			groups.forEach(g => {
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

	resources.forEach(r => {
		if (r.group == '' || !r.group)
			$scope.menu.push({name: r.name, caption: r.caption, icon: r.icon, iconClass: r.iconClass, active: false, isGroup: false});
		else {
			var group = getGroup(r.group);
			group.items.push({name: r.name, caption: r.caption, icon: r.icon, iconClass: r.iconClass, active: false, isGroup: false});
		}
	});

	$scope.setCurrentResource = path => {
		var p = path;
		if (path){
			p = path.split('/');
			p = '/' + p[1];
		}

		app.appConfig.resources.forEach(r => {
			if (p === '/' + r.name || (p === '/' && r.name === app.appConfig.resources[0].name)){
				$scope.currentResource = r;
				app.setTitle();
				$scope.menu.forEach(m => {
					m.active = false;
					if (m.isGroup) {
						var isActive = false;
						m.items.forEach(s => {
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
	app.messageBox = msg => {
		$scope.showMessageBox = !$scope.showMessageBox;
		$scope.messageBoxContent = msg;
	};
}]);