# CocoaMySQL dump
# Version 0.7b3
# http://cocoamysql.sourceforge.net
#
# Host: 127.0.0.1 (MySQL 4.1.18-standard)
# Database: tiddlerbackend_development
# Generation Time: 2006-05-03 10:29:18 -0600
# ************************************************************

# Dump of table directories
# ------------------------------------------------------------

CREATE TABLE `directories` (
  `id` int(11) NOT NULL auto_increment,
  `url` varchar(255) default NULL,
  `path` varchar(255) default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Dump of table directories_recipes
# ------------------------------------------------------------

CREATE TABLE `directories_recipes` (
  `id` int(11) NOT NULL auto_increment,
  `directory_id` int(11) NOT NULL default '0',
  `recipe_id` int(11) NOT NULL default '0',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Dump of table recipes
# ------------------------------------------------------------

CREATE TABLE `recipes` (
  `id` int(11) default NULL,
  `name` int(11) default NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Dump of table users
# ------------------------------------------------------------

CREATE TABLE `users` (
  `id` int(11) NOT NULL auto_increment,
  `login` varchar(80) default NULL,
  `password` varchar(40) default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



# Dump of table users_directories
# ------------------------------------------------------------

CREATE TABLE `users_directories` (
  `id` int(11) NOT NULL auto_increment,
  `user_id` int(11) NOT NULL default '0',
  `directory_id` int(11) NOT NULL default '0',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



