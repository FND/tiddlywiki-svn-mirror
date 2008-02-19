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
('a', 'aaa'),
('Simon', 'dfda'),
('http://simonmcmanus.myopenid.com/', 'dsf23r'),
('http://simonmcmanus.myopenid.com/', 'simonmcmasn'),
('http://simonmcmanus.myopenid.com/', 'aa'),
('http://simonmcmanus.myopenid.com/', 'openid'),
('http://simonmcmanus.myopenid.com/', 'aad'),
('http://simonmcmanus.myopenid.com/', 'eeeer'),
('http://simonmcmanus.myopenid.com/', 'df'),
('http://simonmcmanus.myopenid.com/', 'peas'),
('http://simonmcmanus.myopenid.com/', '1'),
('http://simonmcmanus.myopenid.com/', 'noanono'),
('http://simonmcmanus.myopenid.com/', 'asd'),
('http://simonmcmanus.myopenid.com/', 'errrrr');

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

INSERT INTO `login_session` (`user_id`, `session_token`, `expire`, `ip`) VALUES 
('http://simonmcmanus.myopenid.com/', 'bd1a95a0c2235a4c3efc0323b83af2deaa002c38', '200802151504', '127.0.0.1'),
('http://simonmcmanus.myopenid.com/', '4057ddb4c875599d04307297767a746f5c453de0', '200802151505', '127.0.0.1'),
('http://simonmcmanus.myopenid.com/', 'ab026f4573e8647b153df1e192325a4fbbf174af', '200802151506', '127.0.0.1'),
('http://simonmcmanus.myopenid.com/', '47ef6e9a1891694803baf1ebb314bdf06fcf1a29', '200802151507', '127.0.0.1'),
('http://simonmcmanus.myopenid.com/', '318acab1cbb9d4c3e30ab22afc1a5d71d9f677ec', '200802151507', '127.0.0.1'),
('http://simonmcmanus.myopenid.com/', '4edf5e2374c23c1a0937b28ca45567b3cae630bf', '200802151508', '127.0.0.1'),
('http://simonmcmanus.myopenid.com/', '9fd24bfb5f250d412ca4638fa04c0e0ecac6d1e6', '200802151646', '127.0.0.1');

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
(4, '', 'SiteTitle', 'Welcome', 'changecount="2"', '', 'simon', 'simon', '200712281713', '200712281712', 2),
(5, '', 'SiteSubtitle', 'to ccTiddly', 'changecount="1"', '', 'simon', 'simon', '200712281713', '200712281713', 1),
(6, '', 'GettingStarted', '!!  Here are your workspaces :\\n\\n&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n!!or create a new one here : \\n\\n&lt;&lt;ccCreateWorkspace&gt;&gt;\\n\\n', '', '', 'http://simonmcmanus.myopenid.com/', 'simon', '200802151654', '200712281715', 11),
(40, '', 'SiteTitle', 'ccTiddly', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151311', '200802151311', 0),
(41, '', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151311', '200802151311', 0),
(42, '', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151311', '200802151311', 0),
(43, 'simonmcmanus', 'SiteTitle', 'simonmcmanus', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151327', '200802151327', 0),
(44, 'simonmcmanus', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151327', '200802151327', 0),
(45, 'simonmcmanus', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151327', '200802151327', 0),
(46, 'simonmcmanus2', 'SiteTitle', 'simonmcmanus2', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151328', '200802151328', 0),
(47, 'simonmcmanus2', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151328', '200802151328', 0),
(48, 'simonmcmanus2', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151328', '200802151328', 0),
(49, 'simonmcm3anus2', 'SiteTitle', 'simonmcm3anus2', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151329', '200802151329', 0),
(50, 'simonmcm3anus2', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151329', '200802151329', 0),
(51, 'simonmcm3anus2', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151329', '200802151329', 0),
(52, 'simonmdcm3anus2', 'SiteTitle', 'simonmdcm3anus2', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151331', '200802151331', 0),
(53, 'simonmdcm3anus2', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151331', '200802151331', 0),
(54, 'simonmdcm3anus2', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151331', '200802151331', 0),
(55, 'simonmddcm3anus2', 'SiteTitle', 'simonmddcm3anus2', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151332', '200802151332', 0),
(56, 'simonmddcm3anus2', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151332', '200802151332', 0),
(57, 'simonmddcm3anus2', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151332', '200802151332', 0),
(58, 'simondmddcm3anus2', 'SiteTitle', 'simondmddcm3anus2', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151333', '200802151333', 0),
(59, 'simondmddcm3anus2', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151333', '200802151333', 0),
(60, 'simondmddcm3anus2', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151333', '200802151333', 0),
(61, 'simondmdfdcm3anus2', 'SiteTitle', 'simondmdfdcm3anus2', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151333', '200802151333', 0),
(62, 'simondmdfdcm3anus2', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151333', '200802151333', 0),
(63, 'simondmdfdcm3anus2', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151333', '200802151333', 0),
(64, 'simonsdmdfdcm3anus2', 'SiteTitle', 'simonsdmdfdcm3anus2', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151334', '200802151334', 0),
(65, 'simonsdmdfdcm3anus2', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151334', '200802151334', 0),
(66, 'simonsdmdfdcm3anus2', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151334', '200802151334', 0),
(67, 'simonsdmfdfdcm3anus2', 'SiteTitle', 'simonsdmfdfdcm3anus2', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151335', '200802151335', 0),
(68, 'simonsdmfdfdcm3anus2', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151335', '200802151335', 0),
(69, 'simonsdmfdfdcm3anus2', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151335', '200802151335', 0),
(70, 'simodnsdmfdfdcm3anus2', 'SiteTitle', 'simodnsdmfdfdcm3anus2', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151336', '200802151336', 0),
(71, 'simodnsdmfdfdcm3anus2', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151336', '200802151336', 0),
(72, 'simodnsdmfdfdcm3anus2', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151336', '200802151336', 0),
(73, 'dfd', 'SiteTitle', 'dfd', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151337', '200802151337', 0),
(74, 'dfd', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151337', '200802151337', 0),
(75, 'dfd', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151337', '200802151337', 0),
(76, 'dfda', 'SiteTitle', 'dfda', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151337', '200802151337', 0),
(77, 'dfda', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151337', '200802151337', 0),
(78, 'dfda', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151337', '200802151337', 0),
(79, 'dfdfd', 'SiteTitle', 'dfdfd', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(80, 'dfdfd', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(81, 'dfdfd', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(82, 'dfdfd3', 'SiteTitle', 'dfdfd3', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(83, 'dfdfd3', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(84, 'dfdfd3', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(85, 'dfdfd3aaaaa', 'SiteTitle', 'dfdfd3aaaaa', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(86, 'dfdfd3aaaaa', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(87, 'dfdfd3aaaaa', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(88, 'asdfasdf2323e23e', 'SiteTitle', 'asdfasdf2323e23e', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(89, 'asdfasdf2323e23e', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(90, 'asdfasdf2323e23e', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(91, 'dsf23r', 'SiteTitle', 'dsf23r', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(92, 'dsf23r', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(93, 'dsf23r', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151343', '200802151343', 0),
(94, 'simonmcmasn', 'SiteTitle', 'simonmcmasn', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151457', '200802151457', 0),
(95, 'simonmcmasn', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151457', '200802151457', 0),
(96, 'simonmcmasn', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151457', '200802151457', 0),
(97, 'simonmcmasn', 'GettingStarted', 'Type the text for ''GettingStarted''a', '', '', 'http://simonmcmanus.myopenid.com/', 'http://simonmcmanus.myopenid.com/', '200802151457', '200802151457', 1),
(98, 'aa', 'SiteTitle', 'aa', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151501', '200802151501', 0),
(99, 'aa', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151501', '200802151501', 0),
(100, 'aa', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151501', '200802151501', 0),
(101, 'aa', 'GettingStarted', 'Type the text for ''GettingStarted''df\\n', '', '', 'http://simonmcmanus.myopenid.com/', 'http://simonmcmanus.myopenid.com/', '200802151501', '200802151501', 1),
(102, 'openid', 'SiteTitle', 'openid', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151523', '200802151523', 0),
(103, 'openid', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151523', '200802151523', 0),
(104, 'openid', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151523', '200802151523', 0),
(105, 'openid', 'GettingStarted', 'me\\n', '', '', 'http://simonmcmanus.myopenid.com/', 'http://simonmcmanus.myopenid.com/', '200802151523', '200802151523', 1),
(106, 'aad', 'SiteTitle', 'aad', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151525', '200802151525', 0),
(107, 'aad', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151525', '200802151525', 0),
(108, 'aad', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151525', '200802151525', 0),
(109, 'aad', 'GettingStarted', 'Type the text for ''GettingStarted''\\ndf', '', '', 'http://simonmcmanus.myopenid.com/', 'http://simonmcmanus.myopenid.com/', '200802151525', '200802151525', 1),
(110, 'eeeer', 'SiteTitle', 'eeeer', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151527', '200802151527', 0),
(111, 'eeeer', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151527', '200802151527', 0),
(112, 'eeeer', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151527', '200802151527', 0),
(113, 'eeeer', 'GettingStarted', '&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n&lt;&lt;ccEditWorkspace&gt;&gt;', '', '', 'http://simonmcmanus.myopenid.com/', 'http://simonmcmanus.myopenid.com/', '200802151543', '200802151527', 4),
(114, 'df', 'SiteTitle', 'df', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151559', '200802151559', 0),
(115, 'df', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151559', '200802151559', 0),
(116, 'df', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151559', '200802151559', 0),
(117, 'peas', 'SiteTitle', 'peas', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151654', '200802151654', 0),
(118, 'peas', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151654', '200802151654', 0),
(119, 'peas', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151654', '200802151654', 0),
(120, 'peas', 'GettingStarted', '&lt;&lt;ccEditWorkspace&gt;&gt;', '', '', 'http://simonmcmanus.myopenid.com/', 'http://simonmcmanus.myopenid.com/', '200802151656', '200802151654', 2),
(121, '1', 'SiteTitle', '1', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151656', '200802151656', 0),
(122, '1', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151656', '200802151656', 0),
(123, '1', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151656', '200802151656', 0),
(124, 'noanono', 'SiteTitle', 'noanono', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151657', '200802151657', 0),
(125, 'noanono', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151657', '200802151657', 0),
(126, 'noanono', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151657', '200802151657', 0),
(127, 'asd', 'SiteTitle', 'asd', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151658', '200802151658', 0),
(128, 'asd', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151658', '200802151658', 0),
(129, 'asd', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151658', '200802151658', 0),
(130, 'errrrr', 'SiteTitle', 'errrrr', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151714', '200802151714', 0),
(131, 'errrrr', 'Osmosoft', 'http://osmosoft.com/ More info about osmosoft can be found here ', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151714', '200802151714', 0),
(132, 'errrrr', 'SiteSubtitle', 'Provided by [[Osmosoft]] using TiddlyWiki - The Wiki with a silly name', 'changecount=''1''', '', 'ccTiddly', 'ccTiddly', '200802151714', '200802151714', 0);

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

INSERT INTO `tiddler_revisions` (`id`, `title`, `body`, `fields`, `modified`, `modifier`, `revision`, `tags`, `tiddler_id`) VALUES 
(18, 'GettingStarted', 'Type the text for ''GettingStarted''a', '', '200802151457', 'http://simonmcmanus.myopenid.com/', 1, '', 97),
(19, 'GettingStarted', 'Type the text for ''GettingStarted''df\\n', '', '200802151501', 'http://simonmcmanus.myopenid.com/', 1, '', 101),
(20, 'GettingStarted', 'me\\n', '', '200802151523', 'http://simonmcmanus.myopenid.com/', 1, '', 105),
(21, 'GettingStarted', 'Type the text for ''GettingStarted''\\ndf', '', '200802151525', 'http://simonmcmanus.myopenid.com/', 1, '', 109),
(22, 'GettingStarted', 'Type the text for ''GettingStarted''sdf', '', '200802151527', 'http://simonmcmanus.myopenid.com/', 1, '', 113),
(23, 'GettingStarted', '&lt;&lt;ccListWorkspaces&gt;&gt;', '', '200802151532', 'http://simonmcmanus.myopenid.com/', 2, '', 113),
(24, 'GettingStarted', '&lt;&lt;ccListWorkspaces&gt;&gt;\\n\\n&lt;&lt;ccEditWorkspace&gt;&gt;', '', '200802151532', 'http://simonmcmanus.myopenid.com/', 3, '', 113),
(25, 'GettingStarted', '&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n&lt;&lt;ccEditWorkspace&gt;&gt;', '', '200802151543', 'http://simonmcmanus.myopenid.com/', 4, '', 113),
(26, 'GettingStarted', 'Hi, \\n\\nWelcome to ccTiddly, \\n\\nYou can create you own workspace below : \\n\\n&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n\\nHere you can see what other people are  sharing on this ccTiddly server. \\n\\n&lt;&lt;ccListWorkspaces&gt;&gt;\\n\\n\\n', '', '200802151637', 'http://simonmcmanus.myopenid.com/', 3, '', 6),
(27, 'GettingStarted', 'Hi, \\n\\nWelcome to ccTiddly, \\n\\nYou can create you own workspace below : \\n\\n&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n\\nor create a new one here : \\n\\n&lt;&lt;ccListWorkspaces&gt;&gt;\\n\\n', '', '200802151638', 'http://simonmcmanus.myopenid.com/', 4, '', 6),
(28, 'GettingStarted', 'Hi, \\n\\nWelcome to ccTiddly, \\n\\nYou can create you own workspace below : \\n\\n&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n\\nor create a new one here : \\n\\n&lt;&lt;ccCreateWorkspace&gt;&gt;\\n\\n', '', '200802151638', 'http://simonmcmanus.myopenid.com/', 5, '', 6),
(29, 'GettingStarted', 'Hi, \\n\\nWelcome to ccTiddly, \\n\\nYou can create you own workspace below : \\n\\n&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n\\n!!or create a new one here : \\n\\n&lt;&lt;ccCreateWorkspace&gt;&gt;\\n\\n', '', '200802151638', 'http://simonmcmanus.myopenid.com/', 6, '', 6),
(30, 'GettingStarted', '!!  Here are your workspaces ; \\n\\n&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n\\n!!or create a new one here : \\n\\n&lt;&lt;ccCreateWorkspace&gt;&gt;\\n\\n', '', '200802151638', 'http://simonmcmanus.myopenid.com/', 7, '', 6),
(31, 'GettingStarted', '!!  Here are your workspaces :\\n\\n&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n\\n!!or create a new one here : \\n\\n&lt;&lt;ccCreateWorkspace&gt;&gt;\\n\\n', '', '200802151638', 'http://simonmcmanus.myopenid.com/', 8, '', 6),
(32, 'GettingStarted', '!!  Here are your workspaces :\\n\\n&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n!!or create a new one here : \\n\\n&lt;&lt;ccCreateWorkspace&gt;&gt;\\n\\n', '', '200802151639', 'http://simonmcmanus.myopenid.com/', 9, '', 6),
(33, 'GettingStarted', '!!  Here are your workspaces :\\n\\n&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n!!or create a new one here : \\n\\n&lt;&lt;ccCreateWorkspace&gt;&gt;\\n\\n', '', '200802151642', 'http://simonmcmanus.myopenid.com/', 10, '', 6),
(34, 'GettingStarted', '!!  Here are your workspaces :\\n\\n&lt;&lt;ccListMyWorkspaces&gt;&gt;\\n\\n!!or create a new one here : \\n\\n&lt;&lt;ccCreateWorkspace&gt;&gt;\\n\\n', '', '200802151654', 'http://simonmcmanus.myopenid.com/', 11, '', 6),
(35, 'GettingStarted', '&lt;&lt;ccEditWorkspace&gt;&gt;', '', '200802151654', 'http://simonmcmanus.myopenid.com/', 1, '', 120),
(36, 'GettingStarted', '&lt;&lt;ccEditWorkspace&gt;&gt;', '', '200802151656', 'http://simonmcmanus.myopenid.com/', 2, '', 120);

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
('home', 'en', 1, 0, 2000, 0, 'utf8', '1095800459', '', 'tiddlywiki', 'ADDD', 'AAAA', '', ''),
('', 'en', 1, 0, 2000, 0, 'utf8', '118229952', '', 'tiddlywiki', 'AUUU', 'AAAA', '', ''),
('simonmcmanus', 'en', 1, 0, 2000, 0, 'utf8', '522144749', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('simonmcmanus2', 'en', 1, 0, 2000, 0, 'utf8', '1792491725', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('simonmcm3anus2', 'en', 1, 0, 2000, 0, 'utf8', '1605477151', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('simonmdcm3anus2', 'en', 1, 0, 2000, 0, 'utf8', '961844572', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('simonmddcm3anus2', 'en', 1, 0, 2000, 0, 'utf8', '1051781892', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('simondmddcm3anus2', 'en', 1, 0, 2000, 0, 'utf8', '1882145483', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('simondmdfdcm3anus2', 'en', 1, 0, 2000, 0, 'utf8', '158939539', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('simonsdmdfdcm3anus2', 'en', 1, 0, 2000, 0, 'utf8', '538730114', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('simonsdmfdfdcm3anus2', 'en', 1, 0, 2000, 0, 'utf8', '112424119', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('simodnsdmfdfdcm3anus2', 'en', 1, 0, 2000, 0, 'utf8', '297244840', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('dfd', 'en', 1, 0, 2000, 0, 'utf8', '1156586694', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('dfda', 'en', 1, 0, 2000, 0, 'utf8', '500109423', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('dfdfd', 'en', 1, 0, 2000, 0, 'utf8', '1305444110', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('dfdfd3', 'en', 1, 0, 2000, 0, 'utf8', '955201978', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('dfdfd3aaaaa', 'en', 1, 0, 2000, 0, 'utf8', '349997129', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('asdfasdf2323e23e', 'en', 1, 0, 2000, 0, 'utf8', '1331214115', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('dsf23r', 'en', 1, 0, 2000, 0, 'utf8', '917487159', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('simonmcmasn', 'en', 1, 0, 2000, 0, 'utf8', '1342320091', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('aa', 'en', 1, 0, 2000, 0, 'utf8', '1201081601', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('openid', 'en', 1, 0, 2000, 0, 'utf8', '1386102142', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('aad', 'en', 1, 0, 2000, 0, 'utf8', '751802916', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('eeeer', 'en', 1, 0, 2000, 0, 'utf8', '1130116092', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('df', 'en', 1, 0, 2000, 0, 'utf8', '1910614500', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('peas', 'en', 1, 0, 2000, 0, 'utf8', '2077581119', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('1', 'en', 1, 0, 2000, 0, 'utf8', '695928935', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('noanono', 'en', 1, 0, 2000, 0, 'utf8', '287063978', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('asd', 'en', 1, 0, 2000, 0, 'utf8', '798218011', '', 'tiddlywiki', 'DDDD', 'AAAA', '', ''),
('errrrr', 'en', 1, 0, 2000, 0, 'utf8', '1922317582', '', 'tiddlywiki', 'DDDD', 'AAAA', '', '');

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

INSERT INTO `workspace_view` (`id`, `username`, `workspace`, `time`) VALUES 
(1, 'simon', 'smm', '2008-02-15 15:58:45'),
(2, 'simon', 'smm', '2008-02-15 15:59:32'),
(3, 'simon', 'smm', '2008-02-15 15:59:32'),
(4, 'simon', 'smm', '2008-02-15 16:05:18'),
(5, 'simon', 'smm', '2008-02-15 16:06:14'),
(6, 'simon', 'smm', '2008-02-15 16:06:49'),
(7, 'simon', 'smm', '2008-02-15 16:07:12'),
(8, 'simon', 'smm', '2008-02-15 16:07:32'),
(9, 'simon', 'smm', '2008-02-15 16:07:58'),
(10, 'simon', 'smm', '2008-02-15 16:08:06'),
(11, 'simon', 'smm', '2008-02-15 16:08:21'),
(12, 'simon', 'smm', '2008-02-15 16:08:28'),
(13, 'simon', 'smm', '2008-02-15 16:08:33'),
(14, 'simon', 'smm', '2008-02-15 16:08:38'),
(15, 'simon', 'smm', '2008-02-15 16:09:19'),
(16, 'simon', 'smm', '2008-02-15 16:09:32'),
(17, 'simon', 'smm', '2008-02-15 16:10:58'),
(18, 'simon', 'smm', '2008-02-15 16:11:10'),
(19, 'simon', 'smm', '2008-02-15 16:11:27'),
(20, 'simon', 'smm', '2008-02-15 16:11:29'),
(21, 'simon', 'smm', '2008-02-15 16:11:42'),
(22, 'simon', 'smm', '2008-02-15 16:11:43'),
(23, 'simon', 'smm', '2008-02-15 16:11:50'),
(24, 'simon', 'smm', '2008-02-15 16:12:29'),
(25, 'simon', 'smm', '2008-02-15 16:13:15'),
(26, 'simon', 'smm', '2008-02-15 16:23:31'),
(27, 'simon', 'smm', '2008-02-15 16:33:23'),
(28, 'simon', 'smm', '2008-02-15 16:35:14'),
(29, 'simon', 'smm', '2008-02-15 16:35:17'),
(30, 'simon', 'smm', '2008-02-15 16:35:24'),
(31, 'simon', 'smm', '2008-02-15 16:35:47'),
(32, 'simon', 'smm', '2008-02-15 16:37:30'),
(33, 'simon', 'smm', '2008-02-15 16:37:50'),
(34, 'simon', 'smm', '2008-02-15 16:39:04'),
(35, 'simon', 'smm', '2008-02-15 16:41:50'),
(36, 'simon', 'smm', '2008-02-15 16:42:47'),
(37, 'simon', 'smm', '2008-02-15 16:50:22'),
(38, 'simon', 'smm', '2008-02-15 16:50:51'),
(39, 'simon', 'smm', '2008-02-15 16:51:14'),
(40, 'simon', 'smm', '2008-02-15 16:51:46'),
(41, 'simon', 'smm', '2008-02-15 16:52:05'),
(42, 'simon', 'smm', '2008-02-15 16:52:55'),
(43, 'simon', 'smm', '2008-02-15 16:54:02'),
(44, 'simon', 'smm', '2008-02-15 16:54:41'),
(45, 'simon', 'smm', '2008-02-15 16:54:41'),
(46, 'simon', 'smm', '2008-02-15 16:54:57'),
(47, 'simon', 'smm', '2008-02-15 16:54:58'),
(48, 'simon', 'smm', '2008-02-15 16:55:01'),
(49, 'simon', 'smm', '2008-02-15 16:56:48'),
(50, 'simon', 'smm', '2008-02-15 16:56:48'),
(51, 'simon', 'smm', '2008-02-15 16:57:00'),
(52, 'simon', 'smm', '2008-02-15 16:57:00'),
(53, 'simon', 'smm', '2008-02-15 16:57:18'),
(54, 'simon', 'smm', '2008-02-15 16:57:19'),
(55, 'simon', 'smm', '2008-02-15 16:57:29'),
(56, 'simon', 'smm', '2008-02-15 16:57:30'),
(57, 'simon', 'smm', '2008-02-15 16:57:53'),
(58, 'simon', 'smm', '2008-02-15 16:58:29'),
(59, 'simon', 'smm', '2008-02-15 16:58:29'),
(60, 'simon', 'smm', '2008-02-15 16:58:31'),
(61, 'simon', 'smm', '2008-02-15 16:58:31'),
(62, 'simon', 'smm', '2008-02-15 16:58:33'),
(63, 'simon', 'smm', '2008-02-15 16:58:43'),
(64, 'simon', 'smm', '2008-02-15 16:58:46'),
(65, 'simon', 'smm', '2008-02-15 17:07:50'),
(66, 'simon', 'smm', '2008-02-15 17:08:00'),
(67, 'simon', 'smm', '2008-02-15 17:08:39'),
(68, 'simon', 'smm', '2008-02-15 17:08:40'),
(69, 'simon', 'smm', '2008-02-15 17:09:00'),
(70, 'simon', 'smm', '2008-02-15 17:10:39'),
(71, 'simon', 'smm', '2008-02-15 17:11:33'),
(72, 'simon', 'smm', '2008-02-15 17:12:04'),
(73, 'simon', 'smm', '2008-02-15 17:12:22'),
(74, 'simon', 'smm', '2008-02-15 17:14:11'),
(75, 'simon', 'smm', '2008-02-15 17:14:11'),
(76, 'simon', 'smm', '2008-02-15 17:14:14'),
(77, 'simon', 'smm', '2008-02-15 17:14:14'),
(78, 'simon', 'smm', '2008-02-15 17:14:18'),
(79, 'simon', 'smm', '2008-02-15 17:14:28'),
(80, 'simon', 'smm', '2008-02-15 17:14:31'),
(81, 'simon', 'smm', '2008-02-18 17:22:28');
