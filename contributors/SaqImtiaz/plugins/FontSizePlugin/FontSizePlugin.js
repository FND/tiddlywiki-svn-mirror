/***
|''Name:''|FontSizePlugin|
|''Description:''|Resize tiddler text on the fly. The text size is remembered between sessions.|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#FontSizePlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.2|
!!Installation:
*Copy the contents of this tiddler to your TW, tag with systemConfig, save and reload your TW.
*Then put {{{<<fontSize "font-size:">>}}} in your SideBarOptions tiddler, or anywhere else that you might like.

!!Usage
*{{{<<fontSize>>}}} results in <<fontSize>>
**{{{<<fontSize font-size: >>}}} results in <<fontSize font-size:>>
*Also, you can load a TW file with a font-size specified in the url.
**Eg: http://tw.lewcid.org/#font:110

!!Customizing:
*The buttons and prefix text are wrapped in a span with class fontResizer, for easy css styling.
*To change the default font-size, and the maximum and minimum font-size allowed, edit the config.fontSize.settings section of the code below.

!!Notes:
*This plugin assumes that the initial font-size is 100% and then increases or decreases the size by 10%. This stepsize of 10% can also be customized.
***/
// /%
//!BEGIN-PLUGIN-CODE
config.fontSize={};

//configuration settings
config.fontSize.settings =
{
	defaultSize : 100,  // all sizes in %
	maxSize : 200,
	minSize : 40,
	stepSize : 10
};

config.macros.fontSize={};
config.macros.fontSize.handler = function (place,macroName,params,wikifier,paramString,tiddler)
{
	var sp = createTiddlyElement(place,"span",null,"fontResizer");
	sp.ondblclick=this.onDblClick;
	if (params[0])
		createTiddlyText(sp,params[0]);
	createTiddlyButton(sp,"+","increase font-size",this.incFont);
	createTiddlyButton(sp,"=","reset font-size",this.resetFont);
	createTiddlyButton(sp,"–","decrease font-size",this.decFont);
};

config.macros.fontSize.onDblClick = function (e)
{
	if (!e) var e = window.event;
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return false;
};

config.macros.fontSize.setFont = function ()
{
	saveOptionCookie("txtFontSize");
	setStylesheet(".tiddler .viewer,.tiddler .editor {font-size:"+config.options.txtFontSize+"%;}\n","fontResizerStyles");
};

config.macros.fontSize.incFont=function()
{
	if (config.options.txtFontSize < config.fontSize.settings.maxSize)
		config.options.txtFontSize = (config.options.txtFontSize*1)+config.fontSize.settings.stepSize;
	config.macros.fontSize.setFont();
};

config.macros.fontSize.decFont=function()
{
	if (config.options.txtFontSize > config.fontSize.settings.minSize)
		config.options.txtFontSize = (config.options.txtFontSize*1) - config.fontSize.settings.stepSize;
	config.macros.fontSize.setFont();
};

config.macros.fontSize.resetFont=function()
{
	config.options.txtFontSize=config.fontSize.settings.defaultSize;
	config.macros.fontSize.setFont();
};

config.paramifiers.font =
{
	onstart: function(v){
				config.options.txtFontSize = v;
				config.macros.fontSize.setFont();
				}
};

config.macros.fontSize.init = function(){
	if (!config.options.txtFontSize){
		config.options.txtFontSize = config.fontSize.settings.defaultSize;
		saveOptionCookie("txtFontSize");
		}
		setStylesheet(".tiddler .viewer,.tiddler .editor {font-size:"+config.options.txtFontSize+"%;}\n","fontResizerStyles");
		setStylesheet("#contentWrapper .fontResizer .button {display:inline;font-size:105%; font-weight:bold; margin:0 1px; padding: 0 3px; text-align:center !important;}\n .fontResizer {margin:0 0.5em;}","fontResizerButtonStyles");
};
//!END-PLUGIN-CODE
// %/