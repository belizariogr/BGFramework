module.exports = {
	name: 'validatetoken',
	path: '/validatetoken',
	isPublic: true,
	post: function(req, res){
		try {			
			var token_obj = token_service.verify(req.body.token);
			var offset = new Date().getTimezoneOffset() * 60;
			var d = new Date();
			d.setTime((token_obj.iat - offset) * 1000);
			d.setHours(0,0,0,0);
			var now = new Date();
			now.setTime(now.getTime() - offset * 1000);
			now.setHours(0,0,0,0);
			if (!token_obj || d.getTime() != now.getTime()) 
				return res.status(401).json({error: 'You need a valid token to acess the server.'})			
			res.json({});
		} catch(err){
			res.status(401).json({error: 'You need a valid token to acess the server.'})
		}
	}
}

