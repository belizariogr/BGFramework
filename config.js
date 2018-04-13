'use strict'

module.exports = {

	// HTTP Information
	http_port: 80,
	https_port: 443,

	// Public HTML
	use_public_html: true,

	// List of Resources
	resources: {
		public: [
			'login',
			'validatetoken',
		],
		v1: [
			'dashboard',
			'costumers',
			'products',
		],
	},

	extras: [
		'simple_encrypt',
	],

	// Database Information

	database_type: 'firebird',

	/* mysql_connectionLimit: 50,
	mysql_host: 'localhost',
	mysql_port: 3306,
	mysql_user: 'root',
	mysql_pass: '',
	mysql_database: '', */

	fb_host: 'localhost',
	fb_user: 'SYSDBA',
	fb_pass: 'masterkey',
	fb_database: 'D:/Desenvolvimento/Projetos/Git/BGFramework/DATABASE.FDB',
	fb_connectionLimit: 50,



	use_autoinc: true,
	autoinc_table: 'Users_AutoInc',
	autoinc_accountField: 'UserId',
	autoinc_tableField: 'TableName',
	autoinc_IdField: 'Id',


	// Records Information
	page_records: 20,

	// Token
	jwt_password: '123456', // Dont forget to change this property.
	jwt_expiration: 60 * 24, // expiration time in minutes

}