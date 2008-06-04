/*
** create database
*/

CREATE DATABASE `pluginLibrary`;

/*
** create tables
*/

CREATE TABLE pluginLibrary.repositories (
	ID INT NOT NULL AUTO_INCREMENT ,
	URI TEXT NOT NULL ,
	type VARCHAR(32) NOT NULL ,
	name VARCHAR(128) NOT NULL ,
	contact VARCHAR(128) NOT NULL ,
	added DATETIME NOT NULL ,
	updated DATETIME NOT NULL ,
	skipped INT NOT NULL DEFAULT '0',
	disabled BOOL NOT NULL ,
	PRIMARY KEY ( ID )
) ENGINE = MYISAM;

CREATE TABLE pluginLibrary.plugins (
	ID INT NOT NULL AUTO_INCREMENT ,
	repository_ID INT NOT NULL ,
	available BOOL NOT NULL ,
	name VARCHAR(64) NOT NULL ,
	created DATETIME NULL ,
	modified DATETIME NULL ,
	modifier VARCHAR(64) NULL ,
	updated DATETIME NOT NULL ,
	text TEXT NOT NULL ,
	documentation TEXT NULL ,
	code TEXT NULL ,
	views INT NOT NULL DEFAULT '0',
	annotation TEXT NULL ,
	PRIMARY KEY ( ID )
) ENGINE = MYISAM;

CREATE TABLE pluginLibrary.tags (
	plugin_ID INT NOT NULL ,
	name VARCHAR(64) NOT NULL,
	PRIMARY KEY ( plugin_ID, name )
) ENGINE = MYISAM;

CREATE TABLE pluginLibrary.tiddlerFields (
	plugin_ID INT NOT NULL ,
	name VARCHAR(64) NOT NULL ,
	value TEXT NOT NULL,
	PRIMARY KEY ( plugin_ID, name )
) ENGINE = MYISAM;

CREATE TABLE pluginLibrary.metaslices (
	plugin_ID INT NOT NULL ,
	name VARCHAR(64) NOT NULL ,
	value TEXT NOT NULL,
	PRIMARY KEY ( plugin_ID, name )
) ENGINE = MYISAM;

CREATE TABLE pluginLibrary.keywords (
	plugin_ID INT NOT NULL ,
	name VARCHAR(64) NOT NULL,
	PRIMARY KEY ( plugin_ID, name )
) ENGINE = MYISAM;

CREATE TABLE pluginLibrary.userTags (
	plugin_ID INT NOT NULL ,
	name VARCHAR(64) NOT NULL,
	PRIMARY KEY ( plugin_ID, name )
) ENGINE = MYISAM;

CREATE TABLE pluginLibrary.ratings (
	ID INT NOT NULL AUTO_INCREMENT ,
	plugin_ID INT NOT NULL ,
	IP_address VARCHAR(64) NOT NULL ,
	timestamp DATETIME NOT NULL ,
	value INT NULL ,
	PRIMARY KEY ( ID )
) ENGINE = MYISAM;

CREATE TABLE pluginLibrary.comments (
	ID INT NOT NULL AUTO_INCREMENT ,
	plugin_ID INT NOT NULL ,
	author VARCHAR(64) NOT NULL ,
	IP_address VARCHAR(64) NOT NULL ,
	timestamp DATETIME NOT NULL ,
	text INT NULL ,
	PRIMARY KEY ( ID )
) ENGINE = MYISAM;

/*
** populate repositories table
*/

INSERT INTO pluginLibrary.repositories (
	ID ,
	URI ,
	type ,
	name ,
	contact ,
	added ,
	updated ,
	skipped ,
	disabled
)
VALUES (
	NULL ,
	'http://www.tiddlywiki.com/coreplugins.html',
	'TiddlyWiki',
	'Core Plugins',
	'MartinBudden@gmail.com',
	'2008-05-10',
	'2008-05-10',
	'',
	'1'
);

INSERT INTO pluginLibrary.repositories (
	ID ,
	URI ,
	type ,
	name ,
	contact ,
	added ,
	updated ,
	skipped ,
	disabled
)
VALUES (
	NULL ,
	'http://mptw.tiddlyspot.com',
	'TiddlyWiki',
	'MPTW',
	'SimonBaird@gmail.com',
	'2008-05-10',
	'2008-05-10',
	'',
	'1'
);

INSERT INTO pluginLibrary.repositories (
	ID ,
	URI ,
	type ,
	name ,
	contact ,
	added ,
	updated ,
	skipped ,
	disabled
)
VALUES (
	NULL ,
	'http://localhost/pluginLibrary/dummyTiddlyWiki.html',
	'TiddlyWiki',
	'Core Plugins (dummy)',
	'MartinBudden@gmail.com',
	'2008-05-20',
	'2008-05-20',
	'',
	'0'
);
