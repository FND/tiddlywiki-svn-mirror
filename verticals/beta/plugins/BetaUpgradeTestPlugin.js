/***
|''Name''|BetaUpgradeTestPlugin |
|''Author''|JeremyRuston |
|''Version''|1.0|
|''Date''|13 Apr 2008|
|''CoreVersion''|2.4.0 |
!Description

This plugin overrides the upgrade source location to enable testing of the new upgrade functionality.

***/
//{{{

config.macros.upgrade.source = "http://www.tiddlywiki.com/beta/upgrade.html";

//}}}