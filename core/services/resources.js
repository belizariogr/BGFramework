"use strict";

class Resources {

	static getResources() {
		const fs = require('fs');
		let getDirectories = (path, out) => {
			fs.readdirSync(path).forEach(d => { 
				if (fs.lstatSync(path + '\\' + d).isDirectory()) 
					out.push(d)
			});	
		};
		const resources = {};
		const contexts = [];
		getDirectories('./resources', contexts);
		contexts.forEach(c => {		
			resources[c] = [];
			getDirectories('./resources/' + c, resources[c]);		
		});
		return resources;
	}

	static getExtras() {
		const fs = require('fs');	
		const extras = [];	
		fs.readdirSync('./extras').forEach(d => { 			
			if (fs.lstatSync('./extras/' + d).isFile() && ((/(?:\.([^.]+))?$/.exec(d)[0] + '').toLowerCase() === '.js')) 
				d = d.replace(/(?:\.([^.]+))?$/, '');
				extras.push(d)
		});			
		return extras;
	}

}

module.exports = Resources;