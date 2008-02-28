/***
|''Name:''|ConditionalDisplayPlugin|
|''Description:''|Display the contents of different tiddlers depending on the value of a given variable |
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/ConditionalDisplayPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Feb 28, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|


Usage:
<<conditionalDisplay testSubject testValue ifTrueDisplayThisTiddler ifFalseDisplayThisTiddler>>

***/

//{{{
if(!version.extensions.ConditionalDisplayPlugin) {
version.extensions.ConditionalDisplayPlugin = {installed:true};
	
config.macros.conditionalDisplay = {};
config.macros.conditionalDisplay.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	if(params.length < 3) {
		return;
	}
	
	var testSubject = params[0];
	var testValue = params[1];
	var ifTrueDisplay = params[2];
	var ifFalseDisplay = params[3];
	var ps = [];
	if(testSubject && eval(testSubject) == testValue ) {
		ps.push(ifTrueDisplay);
		config.macros.tiddler.handler(place,'tiddler',ps,wikifier,ps.join(','),tiddler);
	}
	else {
		ps.push(ifFalseDisplay);
		config.macros.tiddler.handler(place,'tiddler',ps,wikifier,ps.join(','),tiddler);
	}
};
} //# end of 'install only once'
//}}}