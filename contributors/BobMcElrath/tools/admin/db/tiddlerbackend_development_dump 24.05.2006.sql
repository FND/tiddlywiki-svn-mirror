# CocoaMySQL dump
# Version 0.7b3
# http://cocoamysql.sourceforge.net
#
# Host: 127.0.0.1 (MySQL 4.1.18-standard)
# Database: tiddlerbackend_development
# Generation Time: 2006-05-24 20:43:53 -0400
# ************************************************************

# Dump of table directories
# ------------------------------------------------------------

CREATE TABLE `directories` (
  `id` int(11) NOT NULL auto_increment,
  `url` varchar(255) default NULL,
  `path` varchar(255) default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `directories` (`id`,`url`,`path`) VALUES ('1','http://svn.tiddlywiki.org/gtd','/User/leegonzales/development/tiddlerbackend/webspaces/gtd');


# Dump of table directories_recipes
# ------------------------------------------------------------

CREATE TABLE `directories_recipes` (
  `id` int(11) NOT NULL auto_increment,
  `directory_id` int(11) NOT NULL default '0',
  `recipe_id` int(11) NOT NULL default '0',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `directories_recipes` (`id`,`directory_id`,`recipe_id`) VALUES ('1','1','1');


# Dump of table recipes
# ------------------------------------------------------------

CREATE TABLE `recipes` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `recipes` (`id`,`name`) VALUES ('1','tiddlywiki.html.recipe');
INSERT INTO `recipes` (`id`,`name`) VALUES ('2','empty.recipe');
INSERT INTO `recipes` (`id`,`name`) VALUES ('3','index.recipe');


# Dump of table users
# ------------------------------------------------------------

CREATE TABLE `users` (
  `id` int(11) NOT NULL auto_increment,
  `login` varchar(80) default NULL,
  `password` varchar(40) default NULL,
  `admin` char(1) NOT NULL default '''',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

INSERT INTO `users` (`id`,`login`,`password`,`admin`) VALUES ('1','leegonzales','8b548c6c52c9598ccafa01386514c22321176c7c','N');


# Dump of table users_directories
# ------------------------------------------------------------

CREATE TABLE `users_directories` (
  `id` int(11) NOT NULL auto_increment,
  `user_id` int(11) NOT NULL default '0',
  `directory_id` int(11) NOT NULL default '0',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



