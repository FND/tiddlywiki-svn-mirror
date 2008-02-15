/***
|''Name:''|testMacro|
|''Description:''|macro to use for general testing|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/verticals\testGeneral/testMacro.js |
|''Version:''|0.0.2|
|''Date:''|July 31, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|

***/

/*{{{*/
config.macros.testMacro = {
	label: "test macro",
	prompt: "test macro",
	title: "Test Macro"
};

config.macros.testMacro.test = function(title,params)
{
	clearMessage();
	displayMessage("Testing");
// insert test code here
};

config.macros.testMacro.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var title = params[0] ? params[0] : config.macros.testMacro.title;
	//#var title = config.macros.testMacro.title;
	//#var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick,null,null,this.accessKey);
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	btn.setAttribute("title",title);
	btn.setAttribute("params",params.join("|"));
};

config.macros.testMacro.onClick = function(e)
{
	var title = this.getAttribute("title");
	var params = this.getAttribute("params").split("|");
	config.macros.testMacro.test(title,params);
	return false;
};
/*}}}*/
