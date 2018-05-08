/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 100126
 Source Host           : localhost:3306
 Source Schema         : bgframework

 Target Server Type    : MySQL
 Target Server Version : 100126
 File Encoding         : 65001

 Date: 07/05/2018 15:38:08
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for accounts
-- ----------------------------
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts`  (
  `Id` int(11) NOT NULL,
  `UserName` varchar(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `Password` varchar(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for accounts_autoinc
-- ----------------------------
DROP TABLE IF EXISTS `accounts_autoinc`;
CREATE TABLE `accounts_autoinc`  (
  `AccountId` int(11) NOT NULL,
  `TableName` varchar(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `Id` int(11) NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for costumers
-- ----------------------------
DROP TABLE IF EXISTS `costumers`;
CREATE TABLE `costumers`  (
  `AccountId` int(11) NOT NULL,
  `Id` int(11) NOT NULL,
  `Name` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `Address` varchar(1000) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `PhoneNumber` varchar(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `Email` varchar(200) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `Birthday` date NULL DEFAULT NULL,
  `Add_Date` date NULL DEFAULT NULL,
  `Add_Time` time(0) NULL DEFAULT NULL,
  `Add_TimeStamp` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0),
  `Gender` varchar(1) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `Is_Married` varchar(1) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `AccountId` int(11) NOT NULL,
  `Id` int(11) NOT NULL,
  `Name` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `Description` varchar(1000) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL,
  `Price` double NULL DEFAULT NULL,
  `Stock` double NULL DEFAULT NULL,
  `Is_Service` varchar(1) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = Compact;

SET FOREIGN_KEY_CHECKS = 1;
