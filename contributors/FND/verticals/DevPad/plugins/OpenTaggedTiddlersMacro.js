/***
|Name|OpenTaggedTiddlersMacro|
|Source|[[FND's DevPad|http://devpad.tiddlyspot.com/#OpenTaggedTiddlersMacro]]|
|Version|0.1.2|
|Author|[[one_each|http://groups.google.com/group/TiddlyWiki/browse_thread/t/77d70c4e01e7c6fa]]|
|Contributor|FND|
|License|public domain|
|~CoreVersion|1.2|
|Type|macro|
|Requires|N/A|
|Overrides|N/A|
|Description|open all tiddlers with a given tag|
!Usage
{{{
<<openAll [[tag]] ["title:..."] [closeAllFirst]>>
}}}
!Options
Although the tag is required as the first parameter, the options listed below are optional and may appear in any order.
|!Option|!Description|
|closeAllFirst|close all other tiddlers first|
|<nowiki>title:Title</nowiki>|button caption (enclose in quotation marks if the text contains spaces)|
!Examples
|!Code|!Output|
|{{{<<openAll systemConfig>>}}}|<<openAll systemConfig>>|
|{{{<<openAll systemConfig closeAllFirst>>}}}|<<openAll systemConfig closeAllFirst>>|
|{{{<<openAll systemConfig "title:Open system tiddlers">>}}}|<<openAll systemConfig "title:Open system tiddlers">>|
!Revision History
!!v0.1.1 (2005-09-01)
* initial release [[by one_each|http://groups.google.com/group/TiddlyWiki/browse_thread/t/77d70c4e01e7c6fa]] (named "openAll macro")
!!v0.1.2 (2005-06-30)
* minor code cleanup by FND
* removed {{{reverseOrder}}} parameter due to incompatibility with TiddlyWiki 2.2
* renamed to OpenTaggedTiddlersMacro
!Issues / To Do
* code cleanup / refactoring
!Code
***/
//{{{
version.extensions.openAll = {major: 0, minor: 1, revision: 1, date: new Date("Jun 30, 2007")};
config.macros.openAll = {}
config.macros.openAll.handler = function(place,macroName,params) {
	var title = "Open all " + params[0];
	var closeAllFirst = "false";
	for(var i = 1; i < params.length; i++) { // skip the first parameter
		if(params[i] == "closeAllFirst")
			closeAllFirst = "true";
		if(params[i].substring(0,6) == "title:")
			title = params[i].substring(6);
	}
	var btn = createTiddlyButton(place,title,null,onClickOpenAllMacro);
	btn.setAttribute("tag",params[0]);
	btn.setAttribute("closeAllFirst",closeAllFirst);
}

// Event handler for 'openAll' macro
function onClickOpenAllMacro(e)
{
	if (!e) var e = window.event;
	var tag = this.getAttribute("tag");
	var tagged = store.getTaggedTiddlers(tag);
	if(this.getAttribute("closeAllFirst") == "true")
		story.closeAllTiddlers();
	for(var t=tagged.length-1; t>=0; t--)
		displayTiddler(this,tagged[t].title,0,null,null,false,e.shiftKey || e.altKey);
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return(false);
}
//}}}