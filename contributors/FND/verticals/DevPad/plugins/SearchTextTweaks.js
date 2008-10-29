/***
|''Name:''|SearchTextTweaks|
|''Description:''|adds descriptive text to the search box|
|''Author:''|Saq Imtiaz (lewcid@gmail.com)|
|''Contributor:''|FND|
|''Source:''|http://tw.lewcid.org/#SearchTextTweaks|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0 beta|
|''Date:''|2007-09-09|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.1|
!Configuration
Using [[StyleSheet]], the {{{inactive}}} class can be used to change the search box's style (using CSS) when it is not active.
For example, the following code dims the text in the search box when it is not active:
{{{
.inactive { color: #aaa; }
}}}
***/
// /%
//!BEGIN-PLUGIN-CODE
//{{{
config.macros.search.defaultText = "Search";

config.macros.search.old_handler = config.macros.search.handler;
config.macros.search.handler = function(place,macroName,params) {
	this.old_handler.apply(this,arguments);
	var e = place.lastChild;
	e.setAttribute("defaultText",params[0]||this.defaultText);
	e.value = e.getAttribute("defaultText");
	e.onblur = function() {
		if(this.value == '' || !this.value)
			this.value = this.getAttribute("defaultText");
		addClass(this, "inactive");
	};
};

config.macros.search.onFocus = function(e) {
	if(this.value == this.getAttribute("defaultText"))
		this.value = '';
	removeClass(this, "inactive");
	this.select();
};
//}}}
//!END-PLUGIN-CODE
// %/