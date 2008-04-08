/***
|''Name:''|MicroformatPlugin|
|''Description:''|Assist constructing Microformats in a TiddlyWiki|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/MicroformatPlugin.js |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.2|

Create hCalendar abbr:
&lt;&lt;dtstart [storeName|'YYYYMMDDHHMM'] [dateFormatString]&gt;&gt;
&lt;&lt;dtend [storeName|'YYYYMMDDHHMM'] [dateFormatSting]&gt;&gt;

Options:
&lt;&lt;option timeFormat&gt;&gt;

***/

//{{{
if(!version.extensions.Microformat) {
version.extensions.Microformat = {installed:true};

	config.options.timeFormat = "0hh:0mm";
	
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
		format = config.options.timeFormat;

		// date is in TiddlyWiki YYYYMMMDDHHMM format
		if(params[0]) {
		    if(params[0].match(/^\d/)) {
			value = params[0];
		    }else{
			value = store.getValue(tiddler,params[0]);
		    }
		}

		// formatDateString
		if(params[1]) {
			format = params[1];
		}

		d = Date.convertFromYYYYMMDDHHMM(value);
		var text = d.formatString(format);

		// microformats is ISO YYYY-MM-DDTHH:MM:SS format

		var iso = value.substr(0,4) + "-" + value.substr(4,2) + "-" + value.substr(6,2) 
			+ "T" + value.substr(8,2) + ":" + value.substr(10,2) + ":00";

		var e = createTiddlyElement(place,'abbr',null,null);
		e.setAttribute('title',iso);
		e.setAttribute('class',className);
		createTiddlyText(e,text);
	};

} //# end of 'install only once'
//}}}
