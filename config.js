"use strict";

module.exports = {
	// Debug
	debug: true,

	// HTTP Information
	httpPort: 80,
	httpsPort: 443,

	// Public HTML
	usePublicHtml: true,

	//Cluster
	useCluster: false,
	workersCount: 0, // 0 = automatic; 1+ = fixed count

	// Database Information
	databaseType: 'mysql',

	mysqlHost: 'localhost',
	mysqlPort: 3306,
	mysqlUser: 'root',
	mysqlPass: '12345',
	mysqlDatabase: 'bgframework',
	mysqlConnectionLimit: 50,

	fbHost: 'localhost',
	fbUser: 'SYSDBA',
	fbPass: 'masterkey',
	fbDatabase: 'D:/Desenvolvimento/Projetos/BGFramework/DATABASE.FDB',
	fbConnectionLimit: 50,

	// Accounting
	accountTable: 'accounts',
	accountIdField: 'id',
	accountUsername: 'username',
	accountPassword: 'password',
	encryptPassword: false,
	allowRegister: true,

	// Auto increment
	useAutoinc: true,
	autoincTable: 'accounts_autoinc',
	autoincTableField: 'tablename',
	autoincIdField: 'id',

	// system fields on Tables
	accountField: 'accountid',
	creationField: '',
	modificationField: '',
	deletionField: '',

	// Records Information
	pageRecords: 20,

	// Token
	jwtPassword: '123456', // Dont forget to change this property.
	jwtExpiration: 60 * 24, // expiration time in minutes

}