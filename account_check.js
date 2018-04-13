module.exports = {

	// function to check if records belong to client. You must use your database rules to implement this function 
	
	account_check: function(action, db_resource, token_obj, req){

		if (action != 'insert' && action != 'update'){			
			// Forcing this condition, prevent to another user to browse records.
			if (!!token_obj)
				return "USERID = " + req.token_obj.Id;
		}
		else if (action == 'insert'){
			// Inserting UserId on Body to prevent Code Injection (another user puting data)
			if (!!req.token_obj && req.token_obj.Id)
				req.body.UserId = req.token_obj.Id; 
		}

	},

}