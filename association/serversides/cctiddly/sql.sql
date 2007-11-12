-- phpMyAdmin SQL Dump
-- version 2.10.1
-- http://www.phpmyadmin.net
-- 
-- Host: localhost
-- Generation Time: Nov 06, 2007 at 10:08 AM
-- Server version: 5.0.41
-- PHP Version: 5.2.2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- 
-- Database: `permissions`
-- 

-- --------------------------------------------------------

-- 
-- Table structure for table `admin_of_instance`
-- 

CREATE TABLE `admin_of_instance` (
  `user_username` varchar(50) NOT NULL,
  `instance_name` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `admin_of_instance`
-- 


-- --------------------------------------------------------

-- 
-- Table structure for table `group_membership`
-- 

CREATE TABLE `group_membership` (
  `user_username` varchar(50) NOT NULL,
  `groupname` varchar(50) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `group_membership`
-- 


-- --------------------------------------------------------

-- 
-- Table structure for table `instance`
-- 

CREATE TABLE `instance` (
  `name` varchar(100) NOT NULL,
  `lang` varchar(10) NOT NULL,
  `keep_revision` int(1) NOT NULL,
  `require_login` int(1) NOT NULL,
  `cookie_expire` int(1) NOT NULL,
  `tag_tiddler_with_modifier` int(1) NOT NULL,
  `char_set` varchar(10) NOT NULL,
  `hashseed` varchar(50) NOT NULL,
  `debug` int(1) NOT NULL,
  `status` varchar(10) NOT NULL,
  `tiddlywiki_type` varchar(10) NOT NULL,
  `anonymous_priv` varchar(4) NOT NULL,
  `user_priv` varchar(4) NOT NULL,
  `rss_group` varchar(50) NOT NULL,
  `markup_group` varchar(50) NOT NULL,
  PRIMARY KEY  (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `instance`
-- 

INSERT INTO `instance` (`name`, `lang`, `keep_revision`, `require_login`, `cookie_expire`, `tag_tiddler_with_modifier`, `char_set`, `hashseed`, `debug`, `status`, `tiddlywiki_type`, `anonymous_priv`, `user_priv`, `rss_group`, `markup_group`) VALUES 
('permissions', 'en', 1, 0, 0, 0, 'utf8', '', 0, '', 'TiddlyWiki', '', '', '', '');

-- --------------------------------------------------------

-- 
-- Table structure for table `login_session`
-- 

CREATE TABLE `login_session` (
  `user_username` varchar(50) NOT NULL,
  `session` varchar(40) NOT NULL COMMENT 'username+password+time',
  `expire` int(20) NOT NULL,
  `ip` varchar(15) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `login_session`
-- 


-- --------------------------------------------------------

-- 
-- Table structure for table `privileges`
-- 

CREATE TABLE `privileges` (
  `id` int(11) NOT NULL auto_increment,
  `read` int(1) NOT NULL,
  `insert` int(1) NOT NULL,
  `edit` int(1) NOT NULL,
  `delete` int(1) NOT NULL,
  `group_membership_groupname` varchar(50) NOT NULL,
  `tag` varchar(50) NOT NULL COMMENT 'for future use',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- 
-- Dumping data for table `privileges`
-- 


-- --------------------------------------------------------

-- 
-- Table structure for table `tiddler`
-- 

CREATE TABLE `tiddler` (
  `id` int(11) NOT NULL auto_increment,
  `instance_name` varchar(100) NOT NULL,
  `title` text NOT NULL,
  `body` mediumtext NOT NULL,
  `fields` text NOT NULL,
  `tags` text NOT NULL,
  `modifier` varchar(50) NOT NULL,
  `creator` varchar(50) NOT NULL,
  `modified` varchar(12) NOT NULL,
  `created` varchar(12) NOT NULL,
  `revision` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- 
-- Dumping data for table `tiddler`
-- 


-- --------------------------------------------------------

-- 
-- Table structure for table `tiddler_revision`
-- 

CREATE TABLE `tiddler_revision` (
  `id` int(11) NOT NULL auto_increment,
  `title` text NOT NULL,
  `body` text NOT NULL,
  `fields` text NOT NULL,
  `modified` varchar(12) NOT NULL,
  `modifier` varchar(50) NOT NULL,
  `revision` int(11) NOT NULL,
  `tags` text NOT NULL,
  `tiddler_id` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- 
-- Dumping data for table `tiddler_revision`
-- 


-- --------------------------------------------------------

-- 
-- Table structure for table `user`
-- 

CREATE TABLE `user` (
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `empoyee_id` varchar(200) NOT NULL,
  PRIMARY KEY  (`username`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `user`
-- 

