/***
|''Name:''|OpenTiddlersMacro|
|''Description:''|Create links that open multiple tiddlers. Optionally close all other tiddlers first.|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#OpenTiddlersMacro|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.3|
!!Usage:
* {{{<<openTiddlers text:"click" tiddlers:[[TiddlerOne TiddlerTwo "Tiddler Three"]]>>}}}
** text: text for the link.
** tiddlers: titles of tiddlers to open, as a bracketed list.
* Additional optional parameters:
** {{{<<openTiddlers text:"click" tiddlers:[[TiddlerOne TiddlerTwo "Tiddler Three"]] closeAll:true keepMe:false>>}}}
*** closeAll: close all other tiddlers first
*** keepMe : close all other tiddlers, except the one containing the macro
!!Tip:
* You can use evaluated parameters to get a list of tiddlers to open from a tiddler.
** For example to open the DefaultTiddlers for a  "Home" button: <br> {{{<<openTiddlers text:"Home" tiddlers:{{store.getTiddlerText("DefaultTiddlers")}} closeAll:true>>}}} <br>  <<openTiddlers text:"Home" tiddlers:{{store.getTiddlerText("DefaultTiddlers")}} closeAll:true>>

***/
// /%
//!BEGIN-PLUGIN-CODE
config.macros.openTiddlers = 
{
	handler : function(place,macroName,params,wikifier,paramString,tiddler)
	{
		var np = paramString.parseParams("anon",null,true,false,false);
		var text = getParam(np,"text","");
		var tiddlers = getParam(np,"tiddlers","");
		if (tiddlers == ''){
			return false;
		}
		if (typeof tiddlers == 'string' ){
			tiddlers = tiddlers.readBracketedList();
		}
		var closeAll = getParam(np,"closeAll","false");
		var keepMe = getParam(np,"keepMe","false");
		var btn= createTiddlyButton(place,text,null,this.onClick,"tiddlyLinkExisting");
		btn.tiddlers = tiddlers;
		btn.tiddler = tiddler? tiddler.title: undefined;
		btn.closeAll = closeAll;
		btn.keepMe = keepMe;
	},
	onClick: function(e)
	{
		var exclude = (this.keepMe == "true")? this.tiddler : undefined;
		var tiddlers = this.tiddlers;
		if(this.closeAll == 'true'){
			story.closeAllTiddlers(exclude);
			tiddlers = (this.keepMe == "true")? tiddlers: tiddlers.reverse();
		}
		story.displayTiddlers(this,this.tiddlers);
		return(false);
	}
};
//!END-PLUGIN-CODE
// %/