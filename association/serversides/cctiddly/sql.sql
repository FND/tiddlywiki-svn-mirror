\-- MySQL dump 10.10
--
-- Host: localhost    Database: cct
-- ------------------------------------------------------
-- Server version	5.0.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_of_instance`
--

DROP TABLE IF EXISTS `admin_of_instance`;
CREATE TABLE `admin_of_instance` (
  `user_id` varchar(255) NOT NULL,
  `instance_name` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `admin_of_instance`
--


/*!40000 ALTER TABLE `admin_of_instance` DISABLE KEYS */;
LOCK TABLES `admin_of_instance` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `admin_of_instance` ENABLE KEYS */;

--
-- Table structure for table `group`
--

DROP TABLE IF EXISTS `group`;
CREATE TABLE `group` (
  `name` varchar(50) NOT NULL,
  `desc` mediumtext NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `group`
--


/*!40000 ALTER TABLE `group` DISABLE KEYS */;
LOCK TABLES `group` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `group` ENABLE KEYS */;

--
-- Table structure for table `group_membership`
--

DROP TABLE IF EXISTS `group_membership`;
CREATE TABLE `group_membership` (
  `user_id` varchar(255) NOT NULL,
  `group_name` varchar(50) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `group_membership`
--


/*!40000 ALTER TABLE `group_membership` DISABLE KEYS */;
LOCK TABLES `group_membership` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `group_membership` ENABLE KEYS */;

--
-- Table structure for table `instance`
--

DROP TABLE IF EXISTS `instance`;
CREATE TABLE `instance` (
  `name` varchar(100) NOT NULL,
  `lang` varchar(10) NOT NULL,
  `keep_revision` int(1) NOT NULL,
  `require_login` int(1) NOT NULL,
  `session_expire` int(10) NOT NULL,
  `tag_tiddler_with_modifier` int(1) NOT NULL,
  `char_set` varchar(10) NOT NULL,
  `hashseed` varchar(50) NOT NULL,
  `debug` int(1) NOT NULL,
  `status` varchar(10) NOT NULL,
  `tiddlywiki_type` varchar(30) NOT NULL,
  `default_anonymous_perm` varchar(4) NOT NULL,
  `default_user_perm` varchar(4) NOT NULL,
  `rss_group` varchar(50) NOT NULL,
  `markup_group` varchar(50) NOT NULL,
  PRIMARY KEY  (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `instance`
--


/*!40000 ALTER TABLE `instance` DISABLE KEYS */;
LOCK TABLES `instance` WRITE;
INSERT INTO `instance` VALUES ('aasdfasdfasdfasdfasdfasdfasdf','en',1,0,0,0,'utf8','2030522521',1,'','tiddlywiki','DDDD','AAAA','',''),('1','en',1,0,0,0,'utf8','520688400',1,'','tiddlywiki','DDDD','AAAA','',''),('2','en',1,0,0,0,'utf8','511731586',1,'','tiddlywiki','DDDD','AAAA','',''),('21','en',1,0,0,0,'utf8','380659129',1,'','tiddlywiki','DDDD','AAAA','',''),('21234234','en',1,0,0,0,'utf8','1753845780',1,'','tiddlywiki','DDDD','AAAA','',''),('aaaa','en',1,0,0,0,'utf8','696697337',1,'','tiddlywiki','DDDD','AAAA','',''),('aaaaaa','en',1,0,0,0,'utf8','426988910',1,'','tiddlywiki','DDDD','AAAA','',''),('sdfsdfsdf','en',1,0,0,0,'utf8','2141789596',1,'','tiddlywiki','DDDD','AAAA','',''),('index.php','en',1,0,0,0,'utf8','1296400891',1,'','tiddlywiki','DDDD','AAAA','',''),('home','en',1,0,0,0,'utf8','9654989',1,'','tiddlywiki','ADDD','AAAA','',''),('a','en',1,0,0,0,'utf8','1536941713',1,'','tiddlywiki','DDDD','AAAA','',''),('b','en',1,0,0,0,'utf8','596254340',1,'','tiddlywiki','DDDD','AAAA','',''),('c','en',1,0,0,0,'utf8','1499481309',1,'','tiddlywiki','DDDD','AAAA','',''),('d','en',1,0,0,0,'utf8','1380840430',1,'','tiddlywiki','DDDD','AAAA','',''),('e','en',1,0,0,0,'utf8','1778759056',1,'','tiddlywiki','DDDD','AAAA','',''),('e12','en',1,0,0,0,'utf8','1821362473',1,'','tiddlywiki','DDDD','AAAA','',''),('hometests','en',1,0,0,0,'utf8','102743156',1,'','tiddlywiki','DDDD','AAAA','',''),('sdsdfsdfsdfsdf','en',1,0,0,0,'utf8','2049700726',1,'','tiddlywiki','DDDD','AAAA','',''),('s','en',1,0,0,0,'utf8','1292301190',1,'','tiddlywiki','DDDD','AAAA','',''),('gmail','en',1,0,0,0,'utf8','320336277',1,'','tiddlywiki','DDDD','AAAA','',''),('hsdfsdf','en',1,0,0,0,'utf8','1893554373',1,'','tiddlywiki','DDDD','AAAA','',''),('show&tell','en',1,0,0,0,'utf8','1680086713',1,'','tiddlywiki','DDDD','AAAA','',''),('showtell','en',1,0,0,0,'utf8','449740864',1,'','tiddlywiki','DDDD','AAAA','',''),('simonmcmanus','en',1,0,0,0,'utf8','1875670625',1,'','tiddlywiki','DDDD','AAAA','',''),('coolcold','en',1,0,0,0,'utf8','2042410510',1,'','tiddlywiki','DDDD','AAAA','',''),('coolcold1','en',1,0,0,0,'utf8','573454116',1,'','tiddlywiki','DDDD','AAAA','',''),('coolcold11','en',1,0,0,0,'utf8','980367192',1,'','tiddlywiki','DDDD','AAAA','',''),('tiddlychatter','en',1,0,0,0,'utf8','448196914',1,'','tiddlywiki','DDDD','AAAA','',''),('tiddlychatter1','en',1,0,0,0,'utf8','1120184625',1,'','tiddlywiki','DDDD','AAAA','',''),('tiddlychatter2','en',1,0,0,0,'utf8','444386945',1,'','tiddlywiki','DDDD','AAAA','',''),('tiddlychatter3','en',1,0,0,0,'utf8','1263647382',1,'','tiddlywiki','DDDD','AAAA','',''),('tiddlychatter4','en',1,0,0,0,'utf8','1116801560',1,'','tiddlywiki','DDDD','AAAA','',''),('tiddlychatter5','en',1,0,0,0,'utf8','1871047972',1,'','tiddlywiki','DDDD','AAAA','',''),('rss','en',1,0,0,0,'utf8','57603930',1,'','tiddlywiki','DDDD','AAAA','',''),('proxy','en',1,0,0,0,'utf8','957113100',1,'','tiddlywiki','DDDD','AAAA','',''),('facebook','en',1,0,0,0,'utf8','377262728',1,'','tiddlywiki','DDDD','AAAA','',''),('df','en',1,0,0,0,'utf8','48961327',1,'','tiddlywiki','ADDD','AAAA','','');
UNLOCK TABLES;
/*!40000 ALTER TABLE `instance` ENABLE KEYS */;

--
-- Table structure for table `login_session`
--

DROP TABLE IF EXISTS `login_session`;
CREATE TABLE `login_session` (
  `user_id` varchar(255) NOT NULL,
  `session_token` varchar(150) NOT NULL COMMENT 'username+password+time',
  `expire` datetime NOT NULL,
  `ip` varchar(15) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `login_session`
--


/*!40000 ALTER TABLE `login_session` DISABLE KEYS */;
LOCK TABLES `login_session` WRITE;
INSERT INTO `login_session` VALUES ('simon','70cd88aa3a35bd5c3afa2480b7752bbfb7822a95','2007-11-14 21:32:08','10.8.18.6'),('simon','ce22905e5049733e17e45fe631c5be99e0a5c2c1','2007-11-14 21:34:04','10.8.18.6'),('simon','75ed65bc6e7489f0837381915bd0985ca1707394','2007-11-14 21:34:32','10.8.18.6'),('simon','bd084135aaad7f89aaf1157520efbaa062cb00e6','2007-11-14 21:34:51','10.8.18.6'),('http://coolcold.wordpress.com/','d2f9831b88a36447832af1a50330d4e4978d82d1','2007-11-18 14:33:52','10.8.18.6'),('simon','6742458db874424175d9a762c51eaf7b81c8f350','2007-11-15 10:45:19','10.8.18.6'),('simon','779efe5cbc95b1c76e6c945875d103544104f920','2007-11-15 11:19:03','10.8.18.6'),('simon','42ba0901f69feec666993f3f8030d32542663bc4','2007-11-15 12:11:07','10.8.18.6'),('simon','326473cc38c4e7c4c0aa6077efb7fab495860daf','2007-11-15 13:47:26','10.8.18.6'),('simon','a197441bcfbf8dc0738ca9ebd39f6398e9afc608','2007-11-15 14:22:17','10.8.18.6'),('simon','5c50cc469d7c021de41bdf2b6e1f09f4907238c9','2007-11-16 16:40:41','10.8.18.6'),('simon','0c4bcf8902b33fa98fcb626d44de81ff4e288358','2007-11-17 14:48:08','10.8.18.6'),('simonmcmanus.com/','21f546eef8e496ec9a99da2bcbb789c30ab0d1f3','2007-11-18 15:02:25','10.8.18.6'),('simon','6f5ede43ccec09c5f954dc46148bde0794cab187','2007-11-18 15:42:26','10.8.18.6'),('simonmcmanus.com/','4c7a934ee963a1250738a0f38f892e9796453062','2007-11-18 16:53:26','10.8.18.6'),('simonmcmanus.com/','92f1da96b476611e32083069e48e8c0496c48d73','2007-11-19 15:02:02','10.8.18.6'),('simonmcmanus.com/','07178b152dcdba6f8304340bfd5ba8984b37961e','2007-11-19 16:28:54','10.8.18.6'),('simonmcmanus.com/','7d1b2ca8370b4f206709c035d1a940507f685458','2007-11-19 17:12:04','10.8.18.6'),('simonmcmanus.com/','97f9cef076cbad5d11cc2848d5d65b2a36e68f7d','2007-11-19 17:47:47','10.8.18.6'),('simonmcmanus.com/','df45896547c2f0e235717a0357d6eb378ebcd788','2007-11-19 18:27:01','10.8.18.6'),('simonmcmanus.com/','457bdede338c050f706dbac11f78b737b88cd81c','2007-11-19 20:03:49','10.8.18.6'),('simon','5db81e00b32f3fdddb89a9dd3641172d5372393c','2007-11-21 20:44:45','10.8.18.6'),('simonmcmanus.myopenid.com/','195f76ea397c509247160a12514849461a5e7de8','2007-11-22 19:21:04','10.8.18.6'),('simonmcmanus.myopenid.com/','a119fb6216a6e1ef40380c4a925b34fd031dc925','2007-11-22 21:25:55','10.8.18.6'),('simon','1ba09564db7a1eca396c4c0a88a307893a534229','2007-11-23 11:17:39','10.8.18.6');
UNLOCK TABLES;
/*!40000 ALTER TABLE `login_session` ENABLE KEYS */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `read` int(1) NOT NULL,
  `insert` int(1) NOT NULL,
  `edit` int(1) NOT NULL,
  `delete` int(1) NOT NULL,
  `group_name` varchar(50) NOT NULL,
  `instance_name` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `permissions`
--


/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
LOCK TABLES `permissions` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;

--
-- Table structure for table `tiddler`
--

DROP TABLE IF EXISTS `tiddler`;
CREATE TABLE `tiddler` (
  `id` int(11) NOT NULL auto_increment,
  `instance_name` varchar(100) NOT NULL,
  `title` text NOT NULL,
  `body` mediumtext NOT NULL,
  `fields` text NOT NULL,
  `tags` text NOT NULL,
  `modifier` varchar(255) NOT NULL,
  `creator` varchar(255) NOT NULL,
  `modified` varchar(12) NOT NULL,
  `created` varchar(12) NOT NULL,
  `version` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tiddler`
--


--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` varchar(255) NOT NULL,
  `password` varchar(50) NOT NULL,
  `short_name` varchar(50) NOT NULL,
  `long_name` varchar(100) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--


/*!40000 ALTER TABLE `user` DISABLE KEYS */;
LOCK TABLES `user` WRITE;
INSERT INTO `user` VALUES ('simon.mcmanus@bt.com','5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8','smm','simonmcmanus');
UNLOCK TABLES;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

