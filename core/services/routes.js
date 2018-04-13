'use strict'

module.exports = {

	items: [],

	add: function(route){
		this.items.push(route);
	},

	remove: function(path){
		for(var i = this.items.length - 1; i--;){
			if (this.items[i].path === path) {
				this.items.splice(i, 1);
				return
			}
		}
	},

	findByPath: function(path){
		for(var i = this.items.length - 1; i--;){
			if (this.items[i].path === path) {
				return this.items[i];
			}
		}
	}
}