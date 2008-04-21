/***
|''Name:''|ccAbout|
|''Description:''|Allows you to find out about your ccTiddly installation|
|''Version:''|2.1.5|
|''Date:''|Nov 27, 2007|
|''Source:''||
|''Author:''|SimonMcManus|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.3.0|
|''Browser:''| Firefox |
***/
//{{{


config.backstageTasks.push(&quot;about&quot;);
// remove the save button from backstage
if(config.backstageTasks[0] == 'save')
	config.backstageTasks.shift();

	
merge(config.tasks,{about: {text: &quot;about&quot;, tooltip: &quot;Find out more about ccTiddly &quot;, content: '&lt;&lt;ccAbout&gt;&gt;'}});

config.macros.ccAbout = {};
config.macros.ccAbout.handler =  function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
	createTiddlyElement(place, "h1","","","About ccTiddly");
	createTiddlyElement(place, "br");
	var str = "You are running ccTiddly "+ccTiddlyVersion;
	createTiddlyText(place, str);
	createTiddlyElement(place, "br");
	createTiddlyElement(place, "br");
	var str = "more info about ccTiddly can be found  at " ;
	createTiddlyText(place, str);
	var link = createExternalLink(place, 'http://tiddlywiki.org/wiki/CcTiddly');
	link.textContent=  'http://tiddlywiki.org/wiki/CcTiddly';
};
//}}}