-- phpMyAdmin SQL Dump
-- version 2.10.1
-- http://www.phpmyadmin.net
-- 
-- Host: localhost
-- Generation Time: Dec 20, 2007 at 04:24 PM
-- Server version: 5.0.41
-- PHP Version: 5.2.2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- 
-- Database: `cctw1`
-- 

-- --------------------------------------------------------

-- 
-- Table structure for table `admin_of_workspace`
-- 

CREATE TABLE `admin_of_workspace` (
  `user_id` varchar(255) NOT NULL,
  `workspace_name` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

-- 
-- Table structure for table `group`
-- 

CREATE TABLE `group` (
  `name` varchar(50) NOT NULL,
  `desc` mediumtext NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

-- 
-- Table structure for table `group_membership`
-- 

CREATE TABLE `group_membership` (
  `user_id` varchar(255) NOT NULL,
  `group_name` varchar(50) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

-- 
-- Table structure for table `workspace`
-- 

CREATE TABLE `workspace` (
  `name` varchar(100) NOT NULL,
  `twLanguage` varchar(10) NOT NULL,
  `keep_revision` int(1) NOT NULL,
  `require_login` int(1) NOT NULL,
  `session_expire` int(10) NOT NULL,
  `tag_tiddler_with_modifier` int(1) NOT NULL,
  `char_set` varchar(10) NOT NULL,
  `hashseed` varchar(50) NOT NULL,
  `status` varchar(10) NOT NULL,
  `tiddlywiki_type` varchar(30) NOT NULL,
  `default_anonymous_perm` varchar(4) NOT NULL,
  `default_user_perm` varchar(4) NOT NULL,
  `rss_group` varchar(50) NOT NULL,
  `markup_group` varchar(50) NOT NULL,
  PRIMARY KEY  (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

-- 
-- Table structure for table `login_session`
-- 

CREATE TABLE `login_session` (
  `user_id` varchar(255) NOT NULL,
  `session_token` varchar(150) NOT NULL COMMENT 'username+password+time',
  `expire` varchar(16) NOT NULL,
  `ip` varchar(15) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

-- 
-- Table structure for table `permissions`
-- 

CREATE TABLE `permissions` (
  `read` int(1) NOT NULL,
  `insert` int(1) NOT NULL,
  `edit` int(1) NOT NULL,
  `delete` int(1) NOT NULL,
  `group_name` varchar(50) NOT NULL,
  `workspace_name` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

-- 
-- Table structure for table `tiddler`
-- 

CREATE TABLE `tiddler` (
  `id` int(11) NOT NULL auto_increment,
  `workspace_name` varchar(100) NOT NULL,
  `title` text NOT NULL,
  `body` mediumtext NOT NULL,
  `fields` text NOT NULL,
  `tags` text NOT NULL,
  `modifier` varchar(255) NOT NULL,
  `creator` varchar(255) NOT NULL,
  `modified` varchar(12) NOT NULL,
  `created` varchar(12) NOT NULL,
  `revision` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=40 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `tiddler_revisions`
-- 

CREATE TABLE `tiddler_revisions` (
  `id` int(11) NOT NULL auto_increment,
  `title` varchar(255) NOT NULL default '',
  `body` text NOT NULL,
  `fields` text NOT NULL,
  `modified` varchar(128) NOT NULL default '',
  `modifier` varchar(255) NOT NULL default '',
  `revision` int(11) NOT NULL default '0',
  `tags` varchar(255) NOT NULL default '',
  `tiddler_id` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=18 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `user`
-- 

CREATE TABLE `user` (
  `username` varchar(255) NOT NULL,
  `password` varchar(50) NOT NULL,
  `short_name` varchar(50) NOT NULL,
  `long_name` varchar(100) NOT NULL,
  PRIMARY KEY  (`username`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



CREATE TABLE `workspace_view` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`username` VARCHAR( 255 ) NOT NULL ,
`workspace` VARCHAR( 255 ) NOT NULL ,
`time` DATETIME NOT NULL
) ENGINE = MYISAM COMMENT = '(`username`,`workspace`,`time`)';


INSERT INTO `user` (`username`, `password`, `short_name`, `long_name`) VALUES 
('simon', '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8', '', '');



INSERT INTO `workspace` (`name`, `twLanguage`, `keep_revision`, `require_login`, `session_expire`, `tag_tiddler_with_modifier`, `char_set`, `hashseed`,  `status`, `tiddlywiki_type`, `default_anonymous_perm`, `default_user_perm`, `rss_group`, `markup_group`) VALUES 
('home', 'en', 1, 0, 2000, 0, 'utf8', '1095800459', '', 'tiddlywiki', 'ADDD', 'AAAA', '', '');



INSERT INTO `tiddler` (`id`, `workspace_name`, `title`, `body`, `fields`, `tags`, `modifier`, `creator`, `modified`, `created`, `revision`) VALUES 
(4, '', 'SiteTitle', 'Welcome', 'changecount="1"', '', 'simon', 'simon', '200712281713', '200712281712', 2),
(5, '', 'SiteSubtitle', 'to ccTiddly', 'changecount="1"', '', 'simon', 'simon', '200712281713', '200712281713', 1),
(6, '', 'GettingStarted', 'Hi, \\n\\nWelcome to ccTiddly, \\nHere is a list of your workspaces : &lt;&lt;ccListMyWorkspaceL&gt;&gt;\\nYou can create you own workspace below : \\n\\n&lt;&lt;ccCreateWorkspace&gt;&gt;\\n\\n\\nHere you can see what other people are  sharing on this ccTiddly server. \\n\\n&lt;&lt;ccListWorkspaces&gt;&gt;\\n\\n\\n', 'changecount="2"', '', 'simon', 'simon', '200712281717', '200712281715', 2);

