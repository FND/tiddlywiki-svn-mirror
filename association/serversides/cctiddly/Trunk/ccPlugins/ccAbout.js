/***
|''Name''|ccAbout|
|''Description''|The ccAbout macro lets you find the current version number in ccTiddly|
|''Author''|Simon McManus|
|''Contributors''|Simon McManus|
|''Version''|2.3|
|''Date''|12/05/08|
|''Status''|@@alpha@@;|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccAbout.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccAbout.js|
|''License''|BSD|
|''Feedback''|http://groups.google.com/group/ccTiddly|
|''Keywords''|ccTiddly ccAbout|


!Usage
{{{
<<ccAbout>>
}}}

***/
//{{{
config.backstageTasks.push("about");

		
merge(config.tasks,{about:{text: "about",tooltip: "Find out more about ccTiddly ",content: '<<ccAbout>>'}});

config.macros.ccAbout={};
config.macros.ccAbout.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){

	
	var w = new Wizard();
	w.createWizard(place,"About");
	var str="You are running ccTiddly " + window.ccTiddlyVersion+"<br /><br />";
	str+="More info about ccTiddly can be found  at <a  target=new  href=http://www.tiddlywiki.org/wiki/CcTiddly>http://www.tiddlywiki.org/wiki/CcTiddly</a><br/><br/>  More information about TiddlyWiki can be found at <a target=new href=http://www.tiddlywiki.com>http://www.tiddlywiki.com</a><br/>" ;
	//var link=createExternalLink(str,'http://tiddlywiki.org/wiki/CcTiddly');
	//link.textContent='http://tiddlywiki.org/wiki/CcTiddly';
	w.addStep(null, str);
	
};
//}}}