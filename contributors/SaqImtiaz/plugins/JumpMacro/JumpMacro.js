/***
|''Name:''|JumpMacro|
|''Description:''|Macro version of the core jump command|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#JumpMacro|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.3|
!!Usage
*{{{<<jump>>}}}<<jump>>
*{{{<<jump customlabel customtooltip top>>}}} <<jump customlabel customtooltip top>>
*Note: passing the third parameter as top, enables the 'top' button in the dropdown.
***/
// /%
//!BEGIN-PLUGIN-CODE
config.macros.jump= {};
config.macros.jump.handler = function (place,macroName,params,wikifier,paramString,tiddler)
{
	var label = (params[0] && params[0]!=".")? params[0]: 'jump';
	var tooltip = (params[1] && params[1]!=".")? params[1]: 'jump to an open tiddler';
	var top = (params[2] && params[2]=='top') ? true: false;        
	var btn =createTiddlyButton(place,label,tooltip,this.onclick);
	if (top==true){
		btn.setAttribute("top","true");
	}
};

config.macros.jump.onclick = function(e)
{
	if (!e) var e = window.event;
	var theTarget = resolveTarget(e);
	var top = theTarget.getAttribute("top");
	var popup = Popup.create(this);
	if(popup){
		if(top=="true"){
			createTiddlyButton(createTiddlyElement(popup,"li"),'Top \u2191','Top of TW',config.macros.jump.top);
			createTiddlyElement(popup,"hr");
		}
		story.forEachTiddler(function(title,element) {
			createTiddlyLink(createTiddlyElement(popup,"li"),title,true);
		});
	}
	Popup.show(popup,false);
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return false;
};

config.macros.jump.top = function()
{
	   window.scrollTo(0,0);
};
//!END-PLUGIN-CODE
// %/