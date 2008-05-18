/***
|''Name:''|ToggleSideBarMacro|
|''Description:''|Show/hide the sidebar.|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#ToggleSideBarMacro|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.3|
!!Usage:
*{{{<<toggleSideBar>>}}} <<toggleSideBar>>
*additional options: <br> {{{<<toggleSideBar label tooltip show/hide>>}}} where:
**label = custom label for the button
**tooltip = custom tooltip for the button
**show/hide = use one or the other, determines whether the sidebar is shown at first or not.<br>(default is to show the sidebar)

***/
// /%
//!BEGIN-PLUGIN-CODE
config.macros.toggleSideBar={};

config.macros.toggleSideBar.settings={
	styleHide :  "#sidebar { display: none;}n"+"#contentWrapper #displayArea { margin-right: 1em;}n"+"",
	styleShow : " ",
	arrow1: "\u00AB",
	arrow2: "\u00BB"
};

config.macros.toggleSideBar.handler=function (place,macroName,params,wikifier,paramString,tiddler)
{
	var tooltip= params[1]||'toggle sidebar';
	var mode = (params[2] && params[2]=="hide")? "hide":"show";
	var arrow = (mode == "hide")? this.settings.arrow1:this.settings.arrow2;
	var label= (params[0]&&params[0]!='.')?params[0]+" "+arrow:arrow;
	var theBtn = createTiddlyButton(place,label,tooltip,this.onToggleSideBar,"button HideSideBarButton");
	if (mode == "hide"){ 
		(document.getElementById("sidebar")).setAttribute("toggle","hide");
		setStylesheet(this.settings.styleHide,"ToggleSideBarStyles");
	}
};

config.macros.toggleSideBar.onToggleSideBar = function()
{
	var sidebar = document.getElementById("sidebar");
	var settings = config.macros.toggleSideBar.settings;
	if (sidebar.getAttribute("toggle")=='hide'){
		setStylesheet(settings.styleShow,"ToggleSideBarStyles");
		sidebar.setAttribute("toggle","show");
		if(this.firstChild.data)
			this.firstChild.data= (this.firstChild.data).replace(settings.arrow1,settings.arrow2);
	}
	else{    
		setStylesheet(settings.styleHide,"ToggleSideBarStyles");
		sidebar.setAttribute("toggle","hide");
		if(this.firstChild.data)
			this.firstChild.data= (this.firstChild.data).replace(settings.arrow2,settings.arrow1);
	}
	return false;
};

setStylesheet(".HideSideBarButton .button {font-weight:bold; padding: 0 5px;}n","ToggleSideBarButtonStyles");
//!END-PLUGIN-CODE
// %/