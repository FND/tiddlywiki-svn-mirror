/***
|''Name:''|ToTopMacro|
|''Description:''|Command and macro, to move to top of the screen.|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#ToTopMacro|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.3|
!!Usage
*{{{<<top>>}}}<<top>>
***/
// /%
//!BEGIN-PLUGIN-CODE
config.macros.top={};
config.macros.top.handler=function(place,macroName)
{
	createTiddlyButton(place,"^","jump to top",this.onclick);
};

config.macros.top.onclick=function()
{
	window.scrollTo(0,0);
};

config.commands.top =
{
	text:" ^ ",
	tooltip:"jump to top"
};

config.commands.top.handler = function(event,src,title)
{
	window.scrollTo(0,0);
};
//!END-PLUGIN-CODE
// %/