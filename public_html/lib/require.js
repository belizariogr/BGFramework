var registred = [];

var require = function(url, callback){
	if (registred.indexOf(url) == -1) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.src = url;
		script.onreadystatechange = callback;
		script.onload = callback;
		head.appendChild(script);
		registred.push(url);
	}
	else if (!!callback)
		callback();
}

var requires = function(urls, callback){
	var exec = 0;
	var callbacks = [];
	for (var i = 0; i < urls.length; i++){
		callbacks[i] = {};
	};
	for (var i = urls.length - 1; i >= 0; i--){
		if (i == urls.length - 1){
			callbacks[i].callback = callback
		}
		else{
			callbacks[i].callback = function(){
				exec++;
				require(urls[exec], callbacks[exec].callback);
			};
		}
	}
	require(urls[exec], callbacks[exec].callback)
}