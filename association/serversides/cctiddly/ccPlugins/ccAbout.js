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
// remove the save button from backstage
if(config.backstageTasks[0]=='save')
	config.backstageTasks.shift();
		
merge(config.tasks,{about:{text: "about",tooltip: "Find out more about ccTiddly ",content: '&lt;&lt;ccAbout&gt;&gt;'}});

config.macros.ccAbout={};
config.macros.ccAbout.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
	createTiddlyElement(place,"h1","","","About ccTiddly");
	createTiddlyElement(place,"br");
	var str="You are running ccTiddly ";
	createTiddlyText(place,str);
	createTiddlyElement(place,"br");
	createTiddlyElement(place,"br");
	var str="more info about ccTiddly can be found  at " ;
	createTiddlyText(place,str);
	var link=createExternalLink(place,'http://tiddlywiki.org/wiki/CcTiddly');
	link.textContent='http://tiddlywiki.org/wiki/CcTiddly';
};
//}}}