/***
|''Name''|ccStats.zh-Hans|
|''Description:''||
|''Contributors''|BramChen|
|''Source:''| |
|''CodeRepository:''| |
|''Version:''|1.7.2|
|''Date:''|Sep 19, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWiki-zh |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
***/
//{{{
merge(config.macros.ccStats, {
	graph24HourTitle:"最近 24 小时",
	graph24HourDesc:"最近 24 小时内，本工作区的点阅数。",
	graph20MinsTitle:"最近 20 分",
	graph20MinsDesc:"最近 20 分钟内，本工作区的点阅数。",
	graph7DaysTitle:"最近 7 天",
	graph7DaysDesc:"最近 7 天内，本工作区的点阅数。",
	graph5MonthsTitle:"最近 5 个月",
	graph5MonthsDesc:"最近 5 个月内，本工作区的点阅数。",
	errorPermissionDenied:"%0 无权检视，您必须是工区 %1 的管理者",
	stepTitle:"工作区统计"
});
//}}}