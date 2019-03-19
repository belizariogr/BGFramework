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

	this.icons = [
		'utensils', 'car', 'heartbeat', 'beer', 'plane',
		'home',	'lightbulb', 'phone', 'shopping-cart', 'building',
		'male', 'female', 'child', 'tshirt', 'shoe-prints',
		'gamepad', 'futbol', 'bicycle', 'film', 'music',
		'paw', 'dog', 'cat', 'horse', 'dove',
		'gas-pump', 'wrench', 'motorcycle', 'bus', 'helicopter',
		'money-bill-alt', 'university', 'credit-card', 'percent', 'exchange-alt',
		'chart-line', 'chart-pie', 'donate','hand-holding-usd', 'dollar-sign',
		'graduation-cap', 'book', 'calendar-alt', 'briefcase', 'bed',
		'birthday-cake', 'gift', 'gem', 'shopping-basket', 'tags',
		'camera', 'video', 'hdd', 'download', 'hashtag',
		'exclamation-triangle', 'question-circle', 'times-circle' , 'ban', 'clock',
		'globe', 'tree', 'sun', 'moon', 'star',
		'truck','envelope', 'map', 'industry', 'barcode',
		'tools', 'hammer', 'plug', 'paint-roller','screwdriver',
		'gavel', 'balance-scale', 'flag', 'church', 'rocket',
		'flask', 'eye-dropper',  'trophy', 'umbrella', 'bomb',
		'lock', 'key', 'piggy-bank', 'smoking',  'mobile-alt',
		'biohazard',  'radiation','recycle',''
	];

	this.colorList = [
		['212121', '616161', '9E9E9E', 'E0E0E0', 'F5F5F5'],
		['0D47A1', '1976D2', '2196F3', '64B5F6', 'BBDEFB'],
		['1B5E20', '388E3C', '4CAF50', '81C784', 'C8E6C9'],
		['FF6F00', 'FFA000', 'FFC107', 'FFD54F', 'FFECB3'],
		['B71C1C', 'D32F2F', 'F44336', 'E57373', 'FFCDD2'],
		['4A148C', '7B1FA2', '9C27B0', 'BA68C8', 'E1BEE7'],
	];

	this.contrastColor = '#555';
	this.borderContrastColor = '#888';
});