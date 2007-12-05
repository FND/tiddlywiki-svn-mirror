/***
|''Name:''|MicroformatPlugin|
|''Description:''|Assist constructing Microformats in a TiddlyWiki|
|''Author:''|PaulDowney|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/MicroformatPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Dec 03, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|


Usage:
<<Microformat className [value] [format]>>

Currently produces a date value ..

***/

//{{{
if(!version.extensions.Microformat) {
version.extensions.Microformat = {installed:true};
	
	config.macros.dtstart = {};
	config.macros.dtstart.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		Microformat_abbr(place,macroName,params,wikifier,paramString,tiddler);
	}

	config.macros.dtend = {};
	config.macros.dtend.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		Microformat_abbr(place,macroName,params,wikifier,paramString,tiddler);
	}

	Microformat_abbr = function(place,macroName,params,wikifier,paramString,tiddler) {

		className = macroName;
		var format = "";

		if(params.length > 0) {
		    value = store.getValue(tiddler,params[0]);
		}
		if(params.length > 1) {
		    format = store.getValue(tiddler,params[1]);
		}

		// assumes date is in TiddlyWiki YYYYMMMDDHHMM format
		// microformats is ISO YYYY-MM-DDTHH:MM:SS format
		var text = value.substr(8,2) + ":" + value.substr(10,2);
		var iso = value.substr(0,4) + "-" + value.substr(4,2) + "-" + value.substr(6,2) + "T" + text + ":00";

		var e = createTiddlyElement(place,'abbr',null,null);
		e.setAttribute('title',iso);
		e.setAttribute('class',className);
		createTiddlyText(e,text);
	};

} //# end of 'install only once'
//}}}
