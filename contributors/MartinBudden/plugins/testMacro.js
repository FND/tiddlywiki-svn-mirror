/***
|''Name:''|testMacro|
|''Description:''|Macro that provides rudimentary test harness|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/testMacro.js |
|''Version:''|0.0.3|
|''Date:''|Mar 21, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2|


***/

/*{{{*/
config.macros.testMacro = {
	label: "test macro",
	title: "test Macro",
	prompt: "click to run test code"
};

testLog = function(text)
{
	if(window.console)
		console.log(text)
	else
		displayMessage(text);
}

function test(params)
{
	testLog('test function called');
	return true;
}

config.macros.testMacro.test = function(fn,params)
{
	clearMessage();
	displayMessage("Testing");
	if(typeof window[fn] == "function")
		var result = window[fn](params);
	else
		result = test(params);
	displayMessage(result ? "Testing complete" : "Test failed");
};

config.macros.testMacro.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var title = params[0] ? params[0] : config.macros.testMacro.title;
	var label = title;
	//#var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick,null,null,this.accessKey);
	var btn = createTiddlyButton(place,label,this.prompt,this.onClick);
	btn.setAttribute("fn",title);
	btn.setAttribute("params",params.join("|"));
};

config.macros.testMacro.onClick = function(e)
{
	var fn = this.getAttribute("fn");
	var params = this.getAttribute("params").split("|");
	config.macros.testMacro.test(fn,params);
	return false;
};
/*}}}*/
