/***
|''Name:''|NavigationMacro|
|''Description:''|Create next and previous buttons between tiddlers|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#NavigationMacro|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.2|
!!Usage:
* Add the macro to the ViewTemplate, specifying the tiddlers to navigate between.
** Below the line: {{{<div class='viewer' macro='view text wikified'></div>}}}<br>add: <br> {{{<div class='viewer' macro='navigation tiddlers:[[Tiddler1 Tiddler2 Tiddler3]]'></div>}}}
* Note the tiddlers parameter that lists the tiddlers and their order, to navigate between.
* Alternatively you can use an evaluated parameter to provide an array of tiddlers or tiddler titles.
** Example: {{{tiddlers:{{store.getTaggedTiddlers("Lewcid","title");}}}}}

!!Example:
[[Demo|NavigationDemo1]]
***/
// /%
//!BEGIN-PLUGIN-CODE
resolveTitle = function(t)
{
	if (t instanceof Tiddler) t = t.title;
	return store.tiddlerExists(t) ? t : null;
};

config.macros.navigation = {};
config.macros.navigation.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if (!store.tiddlerExists(tiddler.title))
			return false;
	var e = createTiddlyElement(place,"span",null,"nav");
	e.setAttribute("refresh","macro");
	e.setAttribute("macroName",macroName);
	e.setAttribute("params",paramString);
	e.setAttribute("tiddler",tiddler.title);
	this.refresh(e,paramString);
};

config.macros.navigation.refresh = function(place,params)
{
	var tiddler = store.getTiddler(place.getAttribute("tiddler"));
	var params = place.getAttribute("params").parseParams("tiddlers",null,true);
	removeChildren(place);
	var tiddlers = getParam(params,"tiddlers",undefined);
	if (typeof tiddlers == 'string')
		tiddlers = tiddlers.readBracketedList();
	if (tiddlers == undefined)
		alert("no source tiddlers defined for navigation");
	var contents = [];
	for (var i=0;i<tiddlers.length;i++)
		{
		var title = resolveTitle(tiddlers[i]);
		contents.push(title);
		}
	var navIndex = contents.indexOf(tiddler.title);
	if (navIndex == -1)
		return false;
	if (contents[navIndex-1])
		{
		wikify("[[<< Previous|"+contents[navIndex-1]+"]]",place);
		place.lastChild.className += " navPrev";
		}
	if (contents[navIndex+1])
		{
		wikify("[[Next >>|"+contents[navIndex+1]+"]]",place);
		place.lastChild.className += " navNext";
		}
	var theTable = createTiddlyElement(place,"table",null,"nav");
	var theBody = createTiddlyElement(theTable,"tbody");
	var theRow = createTiddlyElement(theBody,"tr");
	for (var j=0; j<contents.length; j++)
		{
		var box = createTiddlyElement(theRow,"td",null,"navlinkcell"," ");
		box.onclick = onClickTiddlerLink;
		box.setAttribute("tiddlyLink",contents[j]);
		box.title = (contents[j]);
		if (contents[j] ==tiddler.title)
		   box.className += " activenav";
		}
};

setStylesheet(
	".navNext {float:right;font-family:'Courier New',Courier,monospace;}\n"+
	".navPrev, .navPrevious{float:left;font-family:'Courier New',Courier,monospace;}\n"+
	".nav .tiddlyLink  {color:#000; background:transparent;border:none;padding:0;margin:0;}\n"+
	".nav {padding:0;margin:0;}\n"+
	".viewer .nav table {margin:0 auto !important; border:0px solid #000;padding:0;border-collapse:separate;}\n"+
	".viewer .nav table tr{padding:0; margin:0;border-spacing: 1px;}\n"+
	".viewer .nav table td {padding:4px; border:1px solid #000; border-spacing: 0px;cursor:pointer;cursor:hand}\n"+
	".viewer .nav .activenav{background:#000 !important;}\n","NavigationPluginStyles");
//!END-PLUGIN-CODE
// %/