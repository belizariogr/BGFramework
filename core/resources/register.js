module.exports.route = function(){
	return {
		name: 'register',
		path: '/register',
		isPublic: true,
		post: function(req, res){
			throw "Not implemented yet.";

			/* bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
				// Store hash in your password DB.
			});*/
		}
	}
}
