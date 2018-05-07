'use strict'

module.exports.route = function(){
	return {
		name: 'products',
		path: '/products',
		canGetList: true,
		canGetRecord: true,
		canInsert: true,
		canUpdate: true,
		canDelete: true
	}
}

