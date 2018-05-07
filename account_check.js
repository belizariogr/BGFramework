module.exports = {
	account_check: function(action, db_resource, token_obj, req, params){
		if (action != 'insert' && action != 'update'){
			if (!!token_obj) {
				if (params)
					params.accountid = req.token_obj.Id;
				return "AccountId = " + req.token_obj.Id;
			}
		} else if (action == 'insert' && !!req.token_obj && req.token_obj.Id)
			req.body.AccountId = req.token_obj.Id;
	},

}