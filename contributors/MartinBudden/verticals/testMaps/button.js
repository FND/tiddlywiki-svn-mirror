/***
|''Name:''|button|
|''Description:''|Macro that provides rudimentary test harness|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/button.js |
|''Version:''|0.0.3|
|''Date:''|Mar 21, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2|


***/

/*{{{*/
config.macros.button = {
	label: "button",
	title: "button",
	prompt: "click here"
};

config.macros.button.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var title = params[0] ? params[0] : this.title;
	var fn = params[1];
	var label = title;
	//#var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick,null,null,this.accessKey);
	var btn = createTiddlyButton(place,label,this.prompt,this.onClick);
	btn.setAttribute("fn",fn);
	btn.setAttribute("params",params.join("|"));
};

config.macros.button.onClick = function(e)
{
	var fn = this.getAttribute("fn");
	var params = this.getAttribute("params").split("|");
	if(typeof window[fn] == "function") {
		var result = window[fn](params);
	}
	return false;
};
/*}}}*/
