/***
|''Name''|ccStats.zh-Hant|
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
	graph24HourTitle:"最近 24 小時",
	graph24HourDesc:"最近 24 小時內，本工作區的點閱數。",
	graph20MinsTitle:"最近 20 分",
	graph20MinsDesc:"最近 20 分鐘內，本工作區的點閱數。",
	graph7DaysTitle:"最近 7 天",
	graph7DaysDesc:"最近 7 天內，本工作區的點閱數。",
	graph5MonthsTitle:"最近 5 個月",
	graph5MonthsDesc:"最近 5 個月內，本工作區的點閱數。",
	errorPermissionDenied:"%0 無權檢視，您必須是工區 %1 的管理者",
	stepTitle:"工作區統計"
});
//}}}