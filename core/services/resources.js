module.exports = {

	getResources: function(){
		const fs = require('fs');
		var getDirectories = function(path, out){
			fs.readdirSync(path).forEach(function(d){ 
				if (fs.lstatSync(path + '\\' + d).isDirectory()) 
					out.push(d)
			});	
		};
		const resources = {};
		const contexts = [];
		getDirectories('./resources', contexts);
		contexts.forEach(function(c){		
			resources[c] = [];
			getDirectories('./resources/' + c, resources[c]);		
		});
		return resources;
	},

	getExtras: function(){
		const fs = require('fs');	
		const extras = [];	
		fs.readdirSync('./extras').forEach(function(d){ 			
			if (fs.lstatSync('./extras/' + d).isFile() && ((/(?:\.([^.]+))?$/.exec(d)[0] + '').toLowerCase() === '.js')) 
				d = d.replace(/(?:\.([^.]+))?$/, '');
				extras.push(d)
		});			
		return extras;
	}
};