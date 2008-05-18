/***
|''Name:''|FullScreenPlugin|
|''Description:''|View tiddlers fullsreen, when you need more room.|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#FullScreenPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.3|
!!Usage:
*There is a macro, and a toolbar command.
**{{{<<fullscreen>>}}} macro can be used anywhere inside a tiddler.
** fullscreen command can be added to the toolbar in the ViewTemplate.
!!Demo: <<fullscreen>>
***/
// /%
//!BEGIN-PLUGIN-CODE
var lewcidFullScreen = false;

config.commands.fullscreen =
{
	text:" \u2195 ",
	tooltip:"Fullscreen mode"
};

config.commands.fullscreen.handler = function (event,src,title)
{
	if (lewcidFullScreen == false){
		lewcidFullScreen = true;
		setStylesheet('html,body, #contentWrapper{width:100%;margin:0;padding:0} #backstageArea{display:none;} #sidebar, .header, #mainMenu{display:none;} #displayArea{margin:0em 0 0 0 !important;}',"lewcidFullScreenStyle");
	}
	else{
		lewcidFullScreen = false;
		setStylesheet(' ',"lewcidFullScreenStyle");
	}
};

config.macros.fullscreen={};
config.macros.fullscreen.handler =  function(place,macroName,params,wikifier,paramString,tiddler)
{
	var label = params[0]||" \u2195 ";
	var tooltip = params[1]||"Fullscreen mode";
	createTiddlyButton(place,label,tooltip,config.commands.fullscreen.handler);
};

Story.prototype.lewcid_fullscreen_closeTiddler = Story.prototype.closeTiddler;
Story.prototype.closeTiddler =function(title,animate,slowly)
{
	this.lewcid_fullscreen_closeTiddler.apply(this,arguments);
	if (story.isEmpty() && lewcidFullScreen == true){
		config.commands.fullscreen.handler();
	}
};

Slider.prototype.lewcidStop = Slider.prototype.stop;
Slider.prototype.stop = function()
{
	this.lewcidStop();
	if (story.isEmpty() && lewcidFullScreen == true){
		config.commands.fullscreen.handler();
	}
};
//!END-PLUGIN-CODE
// %/