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

	// System Users
	systemUserTable: '_users',
	systemUserIdField: 'Id',
	systemUsername: 'Username',
	systemPassword: 'Password',
	encryptPassword: false,
	allowRegister: true,

	// Auto increment
	useAutoinc: true,
	autoincTable: '_autoinc',
	autoincTableField: 'TableName',
	autoincIdField: 'Id',

	// system fields on Tables
	systemUserField: '_userId',
	creationField: '_createdAt',
	modificationField: '_modifiedAt',
	deletionField: '_deletedAt',

	// Records Information
	pageRecords: 20,

	// Token
	jwtPassword: '123456', // Dont forget to change this property.
	jwtExpiration: 60 * 24, // expiration time in minutes

}