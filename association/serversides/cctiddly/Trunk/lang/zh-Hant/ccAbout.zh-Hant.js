/***
|''Name''|ccAbout.zh-Hant|
|''Description:''||
|''Contributors''|BramChen|
|''Source:''| |
|''CodeRepository:''| |
|''Version:''|1.7.1|
|''Date:''|Sep 21, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWiki-zh |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
***/
//{{{
merge(config.macros.ccAbout,{
	buttonBackstageText:"關於",
	buttonBackstageTooltip:"關於 ccTiddly",
	stepAboutTitle:"關於",
	stepAboutTextStart:"您現在正在使用 ccTiddly ",
	stepAboutTextEnd:"關於 ccTiddly 的資訊詳見 <a  target=new href=http://www.tiddlywiki.org/wiki/CcTiddly>http://www.tiddlywiki.org/wiki/CcTiddly</a><br/><br/>  關於 TiddlyWiki 的資訊詳見 <a target=new href=http://www.tiddlywiki.com>http://www.tiddlywiki.com</a><br/>"
});
merge(config.tasks,{about:{text: config.macros.ccAbout.buttonBackstageText,tooltip: config.macros.ccAbout.buttonBackstageTooltip,content: '<<ccAbout>>'}});
//}}}