/***
|''Name:''|ConsolePlugin|
|''Description:''|Add a messaging console with acticity monitor to a Tiddlywiki|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/ConsolePlugin.js |
|''Version:''|0.0.1|
|''Date:''|Jan 23, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|

{{{
Usage:

Create a console panel:
<<Console>>

Write to the hidden message panel:
config.macros.Console.log(string);

Display a message:
config.macros.Console.message(string);

Indicate some activity:
config.macros.Console.activity(string);

Reset the console display to its idle state:
config.macros.Console.idle();
}}}

***/

//{{{
if(!version.extensions.ConsolePlugin) {
version.extensions.ConsolePlugin = {installed:true};
	
	config.macros.Console = {};
	config.macros.Console.log = function(str) {

		if(window.console) {
			console.log(str);
			return;
		}
		var t = store.getTiddler('DebugConsole');
		if(t)
			t.text += "\n" + str;
		story.wikify(t);
	};
	
	// config.macros.Console.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	// 	if(config.macros.Console.exists()) {
	// 		this.log('Tiddlyconsole already exists. Duplicate not created.');
	// 		return;
	// 	}
	// 	var con = createTiddlyElement(place,'div','tiddlyconsole',null,null,null);
	// 	var msg = createTiddlyElement(con,'p','message',null,null,null);
	// 	var log = createTiddlyElement(con,'div',null,'log',null,null);
	// 	
	// 	//TODO: Hijack the displayMessage function.
	// 	if(params[0] == 'hijackDisplayMessage') {
	// 		this.log('hijackDisplayMessage');
	// 	}
	// 	//TODO: handle option of defaulting to firebug.
	// 	//this.defaultToFirebug = true;
	// 	
	// };
	// 
	// config.macros.Console.log = function(msg) {
	// 
	// 	//If firebug is present, use that. It's simply better.
	// 	if(window.console) {
	// 		console.log(msg);
	// 		return;
	// 	}
	// 	var c = config.macros.Console.exists();
	// 	if(c) {
	// 		var l = c.getElementsByTagName('div')[0];
	// 		createTiddlyElement(l,'div',null,'entry',msg,null);
	// 	}
	// };
	// 
	// config.macros.Console.message = function(msg) {
	// 	var c = config.macros.Console.exists();
	// 	if(c) {
	// 		var l = c.getElementsByTagName('p')[0];
	// 		createTiddlyElement(l,'div',null,'entry',msg,null);
	// 	}
	// };
	// 
	// config.macros.Console.exists = function() {
	// 	var c = document.getElementById('tiddlyconsole');
	// 	if(c)
	// 		return c;
	// 	else
	// 		return false;
	// };

} //# end of 'install only once'
//}}}