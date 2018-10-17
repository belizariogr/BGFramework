"use strict";

class Routes {

	constructor(server) {
		this.server = server;
		this.items = [];
	}

	add(route) {
		this.items.push(route);
	}

	remove(path) {
		for(var i = this.items.length - 1; i--;){
			if (this.items[i].path === path) {
				this.items.splice(i, 1);
				return
			}
		}
	}

	findByPath(path) {
		for(var i = this.items.length - 1; i--;){
			if (this.items[i].path === path) {
				return this.items[i];
			}
		}
	}

}

module.exports = Routes;