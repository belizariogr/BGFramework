SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for _autoinc
-- ----------------------------
DROP TABLE IF EXISTS `_autoinc`;
CREATE TABLE `_autoinc`  (
  `_userId` bigint NOT NULL,
  `TableName` varchar(255) NOT NULL,
  `Id` bigint NOT NULL,
  PRIMARY KEY (`_userId`, `TableName`) 
);

-- ----------------------------
-- Table structure for _users
-- ----------------------------
DROP TABLE IF EXISTS `_users`;
CREATE TABLE `_users`  (
  `Id` bigint NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`) 
);

-- ----------------------------
-- Records of _users
-- ----------------------------
INSERT INTO `_users` VALUES (1, 'test', 'test');

-- ----------------------------
-- Table structure for costumers
-- ----------------------------
DROP TABLE IF EXISTS `costumers`;
CREATE TABLE `costumers`  (
  `_userId` int NOT NULL,
  `_createdAt` datetime,
  `_modifiedAt` datetime,
  `_deletedAt` datetime,
  `Id` int NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Address` varchar(1000),
  `PhoneNumber` varchar(20),
  `Email` varchar(200),
  `Birthday` date,
  `Add_Date` date,
  `Add_Time` time,
  `Add_TimeStamp` timestamp,
  `Gender` varchar(1),
  `Is_Married` varchar(1),
  PRIMARY KEY (`_userId`, `Id`)
);

-- ----------------------------
-- Records of costumers
-- ----------------------------
INSERT INTO `costumers` VALUES (1, NULL, NULL, NULL, 3, 'Belizario', 'asdfasdfasf', '123123123', 'asdfasdfasdf', NULL, NULL, NULL, '2018-10-17 09:08:39', 'F', 'F');

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `_userId` int NOT NULL,
  `_createdAt` datetime,
  `_modifiedAt` datetime,
  `_deletedAt` datetime,
  `Id` int NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Description` varchar(1000),
  `Price` double,
  `Stock` double,
  `Is_Service` varchar(1),
  PRIMARY KEY (`_userId`, `Id`)
);

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, NULL, NULL, NULL, 1, 'Modem', 'Modem', NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
