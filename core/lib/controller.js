"use strict";

class Controller {
	
	constructor(name, path, isPublic = false) {		
		this.name = name;
		this.path = path;
		this.isPublic = isPublic;
	}

}

module.exports = Controller;