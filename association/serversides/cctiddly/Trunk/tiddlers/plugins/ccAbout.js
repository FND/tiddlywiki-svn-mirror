
/***
|''Name''|ccAbout|
|''Description''|The ccAbout macro lets you find the current version number in ccTiddly|
|''Author''|Simon McManus|
|''Contributors''|Simon McManus|
|''Version''|2.3|
|''Date''|12/05/08|
|''Status''|@@alpha@@;|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/tiddlers/plugins/ccAbout.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/tiddlers/plugins/ccAbout.js|
|''License''|BSD|
|''Feedback''|http://groups.google.com/group/ccTiddly|
|''Keywords''|ccTiddly ccAbout|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
|''Date:''|Nov 6, 2008|
|''Version:''|0.1|


!Usage
{{{
<<ccAbout>>
}}}

***/
//{{{
	
config.macros.ccAbout={};
merge(config.macros.ccAbout,{
	buttonBackstageText:"about",
	buttonBackstageTooltip:"Find out more about ccTiddly ",
	stepAboutTitle:"About",
	stepAboutTextStart:"You are running ccTiddly ",
	stepAboutTextEnd:"More info about ccTiddly can be found  at <a  target=new href=http://www.tiddlywiki.org/wiki/CcTiddly>http://www.tiddlywiki.org/wiki/CcTiddly</a><br/><br/>  More information about TiddlyWiki can be found at <a target=new href=http://www.tiddlywiki.com>http://www.tiddlywiki.com</a><br/>"
});
config.backstageTasks.push(config.macros.ccAbout.buttonBackstageText);
merge(config.tasks,{about:{text: config.macros.ccAbout.buttonBackstageText,tooltip: config.macros.ccAbout.buttonBackstageTooltip,content: '<<ccAbout>>'}});
config.macros.ccAbout.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
	var w = new Wizard();
	var me = config.macros.ccAbout;
	w.createWizard(place,me.stepAboutTitle);
	w.addStep(null, me.stepAboutTextStart + window.ccTiddlyVersion + "<br /><br />" + me.stepAboutTextEnd);
};
//}}}