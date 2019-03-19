/*
 Navicat Premium Data Transfer

 Source Server         : Local
 Source Server Type    : MySQL
 Source Server Version : 100126
 Source Host           : localhost:3306
 Source Schema         : finance

 Target Server Type    : MySQL
 Target Server Version : 100126
 File Encoding         : 65001

 Date: 15/02/2019 18:55:02
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for _autoinc
-- ----------------------------
DROP TABLE IF EXISTS `_autoinc`;
CREATE TABLE `_autoinc`  (
  `_userId` bigint(20) NOT NULL,
  `TableName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `Id` bigint(20) NOT NULL,
  PRIMARY KEY (`_userId`, `TableName`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of _autoinc
-- ----------------------------
INSERT INTO `_autoinc` VALUES (1, 'accounts', 5);
INSERT INTO `_autoinc` VALUES (1, 'payment_methods', 12);
INSERT INTO `_autoinc` VALUES (1, 'persons', 18);
INSERT INTO `_autoinc` VALUES (1, 'transactions', 23);
INSERT INTO `_autoinc` VALUES (1, 'transactions_categories', 20);

-- ----------------------------
-- Table structure for _users
-- ----------------------------
DROP TABLE IF EXISTS `_users`;
CREATE TABLE `_users`  (
  `Id` bigint(20) NOT NULL,
  `Username` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `Password` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`Id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of _users
-- ----------------------------
INSERT INTO `_users` VALUES (1, 'test', 'test');
INSERT INTO `_users` VALUES (2, 'maria', 'maria');

-- ----------------------------
-- Table structure for accounts
-- ----------------------------
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts`  (
  `_userId` bigint(20) NOT NULL,
  `_createdAt` datetime(0) NULL DEFAULT NULL,
  `_modifiedAt` datetime(0) NULL DEFAULT NULL,
  `_deletedAt` datetime(0) NULL DEFAULT NULL,
  `Id` int(11) NOT NULL,
  `Name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `IsActive` tinyint(4) NULL DEFAULT NULL,
  `AllowInsert` tinyint(4) NULL DEFAULT NULL,
  `AccountType` tinyint(4) NULL DEFAULT NULL,
  `ShowInDashboard` tinyint(4) NULL DEFAULT NULL,
  PRIMARY KEY (`_userId`, `Id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of accounts
-- ----------------------------
INSERT INTO `accounts` VALUES (1, '2019-01-21 14:28:35', '2019-02-12 13:34:21', NULL, 1, 'Carteira', 1, 1, 1, 1);
INSERT INTO `accounts` VALUES (1, '2019-01-21 14:28:45', '2019-02-15 10:55:48', NULL, 2, 'Caixa Econômica Federal', 1, 1, 2, 1);

-- ----------------------------
-- Table structure for balances
-- ----------------------------
DROP TABLE IF EXISTS `balances`;
CREATE TABLE `balances`  (
  `_userId` bigint(20) NOT NULL,
  `AccountId` int(11) NOT NULL,
  `Date` date NOT NULL,
  `Forecast` float NOT NULL,
  `Realized` float NOT NULL,
  PRIMARY KEY (`_userId`, `AccountId`, `Date`) USING BTREE,
  INDEX `balances_idx_1`(`_userId`, `AccountId`, `Date`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of balances
-- ----------------------------
INSERT INTO `balances` VALUES (1, 2, '0000-01-01', 0, 0);
INSERT INTO `balances` VALUES (1, 2, '0001-01-01', 0, 0);
INSERT INTO `balances` VALUES (1, 2, '2000-01-01', 0, 0);
INSERT INTO `balances` VALUES (1, 2, '2015-02-15', 0, 0);
INSERT INTO `balances` VALUES (1, 2, '2018-12-31', 0, 0);
INSERT INTO `balances` VALUES (1, 2, '2019-01-01', 0, 0);
INSERT INTO `balances` VALUES (1, 2, '2019-02-11', 0, 0);
INSERT INTO `balances` VALUES (1, 2, '2019-02-12', 0, 0);
INSERT INTO `balances` VALUES (1, 2, '2019-02-13', 0, 0);
INSERT INTO `balances` VALUES (1, 2, '2019-02-14', 0, 0);
INSERT INTO `balances` VALUES (1, 2, '2019-02-15', 5900, 0);
INSERT INTO `balances` VALUES (1, 2, '2019-02-16', 0, 0);
INSERT INTO `balances` VALUES (1, 2, '2019-02-28', 0, 0);
INSERT INTO `balances` VALUES (1, 2, '2019-12-31', 0, 0);

-- ----------------------------
-- Table structure for budgets
-- ----------------------------
DROP TABLE IF EXISTS `budgets`;
CREATE TABLE `budgets`  (
  `_userId` bigint(20) NOT NULL,
  `_createdAt` datetime(0) NULL DEFAULT NULL,
  `_modifiedAt` datetime(0) NULL DEFAULT NULL,
  `_deletedAt` datetime(0) NULL DEFAULT NULL,
  `Id` int(11) NOT NULL,
  `Name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `TransactionCategoryId` int(11) NULL DEFAULT NULL,
  `Value` float NULL DEFAULT NULL,
  `ReceiveAlert` tinyint(4) NULL DEFAULT NULL,
  `Standard` tinyint(4) NULL DEFAULT NULL,
  PRIMARY KEY (`_userId`, `Id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for goals
-- ----------------------------
DROP TABLE IF EXISTS `goals`;
CREATE TABLE `goals`  (
  `_userId` bigint(20) NOT NULL,
  `_createdAt` datetime(0) NULL DEFAULT NULL,
  `_modifiedAt` datetime(0) NULL DEFAULT NULL,
  `_deletedAt` datetime(0) NULL DEFAULT NULL,
  `Id` int(11) NOT NULL,
  `Name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `Value` float NULL DEFAULT NULL,
  `Color` char(8) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `Icon` tinyint(4) NULL DEFAULT NULL,
  `Description` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  PRIMARY KEY (`_userId`, `Id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for payment_methods
-- ----------------------------
DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE `payment_methods`  (
  `_userId` bigint(20) NOT NULL,
  `_createdAt` datetime(0) NULL DEFAULT NULL,
  `_modifiedAt` datetime(0) NULL DEFAULT NULL,
  `_deletedAt` datetime(0) NULL DEFAULT NULL,
  `Id` int(11) NOT NULL,
  `Name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `Type` tinyint(4) NOT NULL,
  `Limit` float NULL DEFAULT NULL,
  `Flag` tinyint(4) NULL DEFAULT NULL,
  `AccountId` int(11) NULL DEFAULT NULL,
  `ClosingDay` tinyint(4) NULL DEFAULT NULL,
  `DueDate` tinyint(4) NULL DEFAULT NULL,
  `Spent` float NULL DEFAULT NULL,
  PRIMARY KEY (`_userId`, `Id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of payment_methods
-- ----------------------------
INSERT INTO `payment_methods` VALUES (1, '2019-01-24 10:41:16', '2019-02-05 08:59:31', NULL, 1, 'Dinheiro', 1, 0, NULL, NULL, 0, 0, NULL);
INSERT INTO `payment_methods` VALUES (1, '2019-01-24 10:51:00', '2019-02-06 14:44:27', NULL, 2, 'Cheque', 4, 0, NULL, NULL, 0, 0, NULL);
INSERT INTO `payment_methods` VALUES (1, '2019-01-25 10:21:55', '2019-02-06 16:15:37', NULL, 3, 'Cartão Nubank', 2, 3100, 1, 2, 5, 15, NULL);
INSERT INTO `payment_methods` VALUES (1, '2019-02-05 16:43:33', '2019-02-06 16:38:08', NULL, 7, 'Cartão de Crédito de Terceiros', 9, 0, 1, NULL, 1, 10, NULL);
INSERT INTO `payment_methods` VALUES (1, '2019-02-05 16:43:49', '2019-02-05 16:43:49', NULL, 8, 'Boleto', 9, NULL, 1, NULL, 1, 10, NULL);
INSERT INTO `payment_methods` VALUES (1, '2019-02-05 16:44:12', '2019-02-06 16:38:22', NULL, 9, 'Cartão Caixa', 3, 0, 1, NULL, 1, 10, NULL);
INSERT INTO `payment_methods` VALUES (1, '2019-02-05 16:47:15', '2019-02-05 16:47:15', NULL, 10, 'Transferência Bancária', 1, NULL, 1, NULL, 1, 10, NULL);
INSERT INTO `payment_methods` VALUES (1, '2019-02-05 16:54:19', '2019-02-05 16:54:19', NULL, 11, 'Depósito Bancário', 1, NULL, 1, NULL, 1, 10, NULL);
INSERT INTO `payment_methods` VALUES (1, '2019-02-08 14:46:16', '2019-02-08 14:46:16', '2019-02-12 10:20:34', 12, 'aaa', 1, 1.1, 1, NULL, 1, 10, NULL);

-- ----------------------------
-- Table structure for persons
-- ----------------------------
DROP TABLE IF EXISTS `persons`;
CREATE TABLE `persons`  (
  `_userId` bigint(20) NOT NULL,
  `_createdAt` datetime(0) NULL DEFAULT NULL,
  `_modifiedAt` datetime(0) NULL DEFAULT NULL,
  `_deletedAt` datetime(0) NULL DEFAULT NULL,
  `Id` bigint(20) NOT NULL,
  `Type` tinyint(4) NOT NULL,
  `Name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `Phone1` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `Phone2` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `Email` varchar(1024) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `Notes` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  PRIMARY KEY (`_userId`, `Id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of persons
-- ----------------------------
INSERT INTO `persons` VALUES (1, '2019-02-06 15:50:06', '2019-02-15 11:17:48', NULL, 2, 4, 'Ana Julia', '33991569303', '', '', NULL);
INSERT INTO `persons` VALUES (1, '2019-02-08 14:32:46', '2019-02-15 11:08:46', NULL, 16, 4, 'Ana Clara', '33991360579', '', NULL, '<3');
INSERT INTO `persons` VALUES (1, '2019-02-08 14:32:57', '2019-02-14 10:40:51', NULL, 17, 1, 'CTEC Informática', '3332719900', '', 'ctec@ctec.com.br', 'Empresa de Informática');
INSERT INTO `persons` VALUES (1, '2019-02-14 10:40:01', '2019-02-14 10:40:01', '2019-02-14 10:40:07', 18, 2, 'Já acabou jessic', '', '', NULL, NULL);

-- ----------------------------
-- Table structure for tags
-- ----------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags`  (
  `_userId` bigint(20) NOT NULL,
  `_createdAt` datetime(0) NULL DEFAULT NULL,
  `_modifiedAt` datetime(0) NULL DEFAULT NULL,
  `_deletedAt` datetime(0) NULL DEFAULT NULL,
  `Id` int(11) NOT NULL,
  `Name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`_userId`, `Id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for transaction_categories
-- ----------------------------
DROP TABLE IF EXISTS `transaction_categories`;
CREATE TABLE `transaction_categories`  (
  `_userId` bigint(20) NOT NULL,
  `_createdAt` datetime(0) NULL DEFAULT NULL,
  `_modifiedAt` datetime(0) NULL DEFAULT NULL,
  `_deletedAt` datetime(0) NULL DEFAULT NULL,
  `Id` int(11) NOT NULL,
  `Name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `Color` char(8) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `Icon` tinyint(4) NULL DEFAULT NULL,
  PRIMARY KEY (`_userId`, `Id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of transaction_categories
-- ----------------------------
INSERT INTO `transaction_categories` VALUES (1, '2019-01-21 16:16:58', '2019-02-06 16:49:22', NULL, 1, 'Lazer', '2196F3', 15);
INSERT INTO `transaction_categories` VALUES (1, '2019-01-21 16:18:10', '2019-02-05 18:33:03', NULL, 2, 'Salários', '388E3C', 38);
INSERT INTO `transaction_categories` VALUES (1, '2019-01-21 16:18:19', '2019-02-05 17:10:19', NULL, 3, 'Alimentação', 'FFC107', 0);
INSERT INTO `transaction_categories` VALUES (1, '2019-01-23 10:22:49', '2019-02-05 19:13:01', NULL, 4, 'Despesas Gerais', '616161', 8);
INSERT INTO `transaction_categories` VALUES (1, '2019-01-24 10:38:27', '2019-02-05 19:13:23', NULL, 5, 'Transporte / Manutenção de Veículos', '9C27B0', 25);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 16:59:23', '2019-02-05 19:13:40', NULL, 6, 'Aquisição de Bens', '64B5F6', 47);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 16:59:49', '2019-02-05 17:11:27', NULL, 7, 'Despesas com Filhos', 'FFD54F', 12);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 17:00:12', '2019-02-05 19:13:50', NULL, 8, 'Educação', 'BA68C8', 40);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 17:02:02', '2019-02-05 18:34:43', NULL, 9, 'Empréstimos', 'C8E6C9', 37);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 17:02:39', '2019-02-08 11:40:31', NULL, 10, 'Impostos', 'E57373', 76);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 17:03:25', '2019-02-05 18:35:06', NULL, 11, 'Investimentos', 'B71C1C', 35);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 17:03:47', '2019-02-05 17:09:02', NULL, 12, 'Juros e Tarifas', 'F44336', 33);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 17:04:57', '2019-02-05 17:11:48', NULL, 13, 'Saúde', 'E0E0E0', 2);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 17:06:03', '2019-02-08 11:41:46', NULL, 14, 'Sem Categoria', '616161', 56);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 17:06:44', '2019-02-05 17:07:38', NULL, 15, 'Venda de Bens', '4CAF50', 9);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 17:07:27', '2019-02-06 16:49:57', NULL, 16, 'Serviços Prestados', '81C784', 43);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 17:10:11', '2019-02-05 17:10:11', NULL, 17, 'Moradia', 'FF6F00', 5);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 17:12:39', '2019-02-05 18:32:49', NULL, 18, 'Transferências', 'F5F5F5', 34);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 17:15:00', '2019-02-05 18:30:34', NULL, 19, 'Provisões', 'BBDEFB', 36);
INSERT INTO `transaction_categories` VALUES (1, '2019-02-05 19:45:00', '2019-02-05 19:45:00', '2019-02-05 19:45:07', 20, 'sss', '1976D2', 0);

-- ----------------------------
-- Table structure for transactions
-- ----------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions`  (
  `_userId` bigint(20) NOT NULL,
  `_createdAt` datetime(3) NULL DEFAULT NULL,
  `_modifiedAt` datetime(3) NULL DEFAULT NULL,
  `_deletedAt` datetime(3) NULL DEFAULT NULL,
  `Id` bigint(20) NOT NULL,
  `Type` tinyint(4) NOT NULL,
  `Description` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `Date` date NULL DEFAULT NULL,
  `Value` float NOT NULL,
  `Realized` float NOT NULL,
  `AccountId` int(11) NOT NULL,
  `CategoryId` int(11) NOT NULL,
  `PaymentMethodId` int(11) NOT NULL,
  `PersonId` int(11) NULL DEFAULT NULL,
  `Note` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `RepeatingType` tinyint(4) NULL DEFAULT NULL,
  `RepeatingStartDate` date NULL DEFAULT NULL,
  `RepeatingEndDate` date NULL DEFAULT NULL,
  `RepeatingCount` int(11) NULL DEFAULT NULL,
  `MainTransactionId` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`_userId`, `Id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of transactions
-- ----------------------------
INSERT INTO `transactions` VALUES (1, '2019-02-11 14:21:35.000', '2019-02-11 14:21:35.000', '2019-02-11 18:15:12.000', 9, 1, 'Pagamento X', '2019-02-11', 100, 0, 1, 4, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `transactions` VALUES (1, '2019-02-11 14:22:24.000', '2019-02-11 18:21:31.000', '2019-02-11 18:21:44.000', 10, 1, 'Pagamento Y', '2019-02-11', 150, 0, 1, 4, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `transactions` VALUES (1, '2019-02-11 14:24:48.000', '2019-02-11 14:24:48.000', '2019-02-11 18:15:16.000', 11, 1, 'Pagamento X', '2019-02-11', 100, 0, 1, 4, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `transactions` VALUES (1, '2019-02-12 10:30:16.000', '2019-02-15 18:54:26.478', NULL, 21, 0, 'TESTE', '2019-02-15', 900, 0, 2, 15, 11, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `transactions` VALUES (1, '2019-02-12 15:38:03.000', '2019-02-15 18:53:59.743', NULL, 22, 0, 'SALARIOS', '2019-02-15', 5000, 0, 2, 2, 11, 17, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `transactions` VALUES (1, '2019-02-12 15:38:27.000', '2019-02-12 17:13:26.000', '2019-02-12 17:13:34.000', 23, 0, 'SALARIOS', '2019-02-08', 4722, 0, 2, 2, 11, 17, NULL, NULL, NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
