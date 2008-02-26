-- phpMyAdmin SQL Dump
-- version 2.10.1
-- http://www.phpmyadmin.net
-- 
-- Host: localhost
-- Generation Time: Feb 18, 2008 at 05:23 PM
-- Server version: 5.0.41
-- PHP Version: 5.2.2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- 
-- Database: `cctw_public2`
-- 

-- --------------------------------------------------------

-- 
-- Table structure for table `admin_of_workspace`
-- 

CREATE TABLE `admin_of_workspace` (
  `username` varchar(255) NOT NULL,
  `workspace_name` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- 
-- Dumping data for table `admin_of_workspace`
-- 

INSERT INTO `admin_of_workspace` (`username`, `workspace_name`) VALUES 
('admin', '');


-- --------------------------------------------------------

-- 
-- Table structure for table `group`
-- 

CREATE TABLE `group` (
  `name` varchar(50) NOT NULL,
  `desc` mediumtext NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- 
-- Dumping data for table `group`
-- 


-- --------------------------------------------------------

-- 
-- Table structure for table `group_membership`
-- 

CREATE TABLE `group_membership` (
  `user_id` varchar(255) NOT NULL,
  `group_name` varchar(50) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- 
-- Dumping data for table `group_membership`
-- 


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

-- 
-- Dumping data for table `login_session`
-- 

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

-- 
-- Dumping data for table `permissions`
-- 


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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=133 ;

-- 
-- Dumping data for table `tiddler`
-- 

INSERT INTO `tiddler` (`id`, `workspace_name`, `title`, `body`, `fields`, `tags`, `modifier`, `creator`, `modified`, `created`, `revision`) VALUES 
(4, '', 'SiteTitle', 'Welcome', 'changecount="1"', '', 'simon', 'simon', '200712281713', '200712281712', 2),
(5, '', 'SiteSubtitle', 'to ccTiddly', 'changecount="1"', '', 'simon', 'simon', '200712281713', '200712281713', 1),
(6, '', 'GettingStarted', '!!  Here are your workspaces :\\n\\n&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n!!or create a new one here : \\n\\n&lt;&lt;ccCreateWorkspace&gt;&gt;\\n\\n', '', '', 'http://simonmcmanus.myopenid.com/', 'simon', '200802151654', '200712281715', 11),
(40, '', 'SiteTitle', 'ccTiddly', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151311', '200802151311', 0),
(41, '', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151311', '200802151311', 0),
(42, '', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151311', '200802151311', 0);


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
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=37 ;

-- 
-- Dumping data for table `tiddler_revisions`
-- 

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

-- 
-- Dumping data for table `user`
-- 

INSERT INTO `user` (`username`, `password`, `short_name`, `long_name`) VALUES 
('admin', '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8', '', ''),
('username', '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8', '', ''),
('simon', '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8', '', ''),
('http://simonmcmanus.myopenid.com/', '', '', '');

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

-- 
-- Dumping data for table `workspace`
-- 

INSERT INTO `workspace` (`name`, `twLanguage`, `keep_revision`, `require_login`, `session_expire`, `tag_tiddler_with_modifier`, `char_set`, `hashseed`, `status`, `tiddlywiki_type`, `default_anonymous_perm`, `default_user_perm`, `rss_group`, `markup_group`) VALUES 
('', 'en', 1, 0, 2000, 0, 'utf8', '118229952', '', 'tiddlywiki', 'AUUU', 'AAAA', '', '');


-- --------------------------------------------------------

-- 
-- Table structure for table `workspace_view`
-- 

CREATE TABLE `workspace_view` (
  `id` int(50) NOT NULL auto_increment,
  `username` varchar(255) NOT NULL,
  `workspace` varchar(255) NOT NULL,
  `time` datetime NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=82 ;

-- 
-- Dumping data for table `workspace_view`
-- 


