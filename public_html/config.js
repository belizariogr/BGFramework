'use strict'

angular.module('appConfigService', []).provider('appConfig', function(){

	this.$get = function() {
		return this;
	};

	// Application Name
	this.appName = 'Example App';

	// 0 = Icon of Awesome Font; 1 = Square Logo Image; 2 = Logo and AppName Image;
	this.logoType =  0;

	// Awesome Font Icon Name
	this.logoIconName = 'rocket';

	// Avaliable Languages
	this.languages = [
		{code: 'en-us', name: 'English (United States)'},
		{code: 'pt-br', name: 'Português (Brasil)'},
	];

	this.notifications = false;
	this.invoices = false;
	this.profile = false;

	// Backend Address
	this.backend_addr = 'http://192.168.5.1';

	// SET THE MENU GROUPS HERE...

	this.menu_groups = [
		//{name: "aditional", caption: "Aditional Data", icon: "database"},
	];

	// SET THE MODULES HERE...

	this.resources = [
		{name: "dashboard", caption: "Dashboard", menu_group: "", icon: "dashboard"},
		{name: "costumers", caption: "Costumers", menu_group: "", icon: "address-book-o"},
		{name: "products", caption: "Products", menu_group: "", icon: "tags"},
		//{name: "relatorios", caption: "Relatórios", menu_group: "", icon: "bar-chart", modal: true},

	];

	this.plugins = [

	];
});