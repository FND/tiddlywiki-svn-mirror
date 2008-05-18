/***
|''Name:''|OpenTopPlugin|
|''Description:''|Open new tiddlers at the top of the screen|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#OpenTopPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.3|
!!Usage:
*
***/
// /%
//!BEGIN-PLUGIN-CODE
Story.prototype.coreLewcidDisplayTiddler=Story.prototype.displayTiddler ;
Story.prototype.displayTiddler =
function(srcElement,title,template,unused1,unused2,animate,slowly)
{
	var srcElement=null;
	if (document.getElementById(this.idPrefix + title)){
		story.closeTiddler(title);
	}
	this.coreLewcidDisplayTiddler(srcElement,title,template,unused1,unused2,animate,slowly);
	window.scrollTo(0,0);
};
//!END-PLUGIN-CODE
// %/