module.exports = {

	// Debug
	debug: true,

	// HTTP Information
	http_port: 80,
	https_port: 443,

	// Public HTML
	use_public_html: true,

	//Cluster
	use_cluster: false,
	workers_count: 0, // 0 = automatic; 1+ = fixed count
	
	// Database Information
	database_type: 'firebird',

	mysql_host: 'localhost',
	mysql_port: 3306,
	mysql_user: 'root',
	mysql_pass: '12345',
	mysql_database: 'bgframework',
	mysql_connectionLimit: 50,

	fb_host: 'localhost',
	fb_user: 'SYSDBA',
	fb_pass: 'masterkey',
	fb_database: 'D:/Desenvolvimento/Projetos/BGFramework/DATABASE.FDB',
	fb_connectionLimit: 50,

	// Accounting
	account_table: 'accounts',
	account_id_field: 'Id',
	account_username: 'Username',
	account_password: 'Password',
	encrypt_password: false,
	allow_register: true,

	// Auto increment
	use_autoinc: true,
	autoinc_table: 'accounts_autoinc',
	autoinc_table_field: 'TableName',
	autoinc_id_field: 'Id',

	// Account Field on Tables
	account_field: 'AccountId',

	// Records Information
	page_records: 20,

	// Token
	jwt_password: '123456', // Dont forget to change this property.
	jwt_expiration: 60 * 24, // expiration time in minutes

}