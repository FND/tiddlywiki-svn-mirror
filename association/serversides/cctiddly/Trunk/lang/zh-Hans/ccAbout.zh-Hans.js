/***
|''Name''|ccAbout.zh-Hans|
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
	buttonBackstageText:"关于",
	buttonBackstageTooltip:"关于 ccTiddly",
	stepAboutTitle:"关于",
	stepAboutTextStart:"您现在正在使用 ccTiddly ",
	stepAboutTextEnd:"关于 ccTiddly 的资讯详见 <a  target=new href=http://www.tiddlywiki.org/wiki/CcTiddly>http://www.tiddlywiki.org/wiki/CcTiddly</a><br/><br/>  关于 TiddlyWiki 的资讯详见 <a target=new href=http://www.tiddlywiki.com>http://www.tiddlywiki.com</a><br/>"
});
merge(config.tasks,{about:{text: config.macros.ccAbout.buttonBackstageText,tooltip: config.macros.ccAbout.buttonBackstageTooltip,content: '<<ccAbout>>'}});
//}}}