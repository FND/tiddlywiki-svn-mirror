/***
|''Name:''|MicroformatDatePlugin|
|''Description:''|Assist constructing Microformat dates in a TiddlyWiki|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/MicroformatDatePlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/MicroformatDatePlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
Create hCalendar abbr:
&lt;&lt;dtstart [storeName|'YYYYMMDDHHMM'] [dateFormatString]&gt;&gt;
<<dtstart '200902211230'>>

&lt;&lt;dtend [storeName|'YYYYMMDDHHMM'] [dateFormatSting]&gt;&gt;

Options:
|<<option txtDisplayTimeFormat>>|<<message config.optionsDesc.txtDisplayTimeFormat>>|
|<<option txtDisplayTimezone>>|<<message config.optionsDesc.txtDisplayTimezone>>|
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config */
if (!version.extensions.MicroformatDatePlugin) {
    version.extensions.MicroformatDatePlugin = {installed: true};

	config.options.txtDisplayTimeFormat = "0hh:0mm";
	config.optionsDesc.txtDisplayTimeFormat = "format to display time fields";
	config.options.txtDisplayTimezone = "";
	config.optionsDesc.txtDisplayTimezone= "timezone to display time fields: UTC, etc. Blank for localtime";
	
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
		var format = config.options.txtDisplayTimeFormat;
		var formatTz = config.options.txtDisplayTimezone;

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

		var text;
		if(!formatTz){
			text = d.formatString(format);
		}else{
			//TBD - handle alternative timezones
			text = d.formatUTCString(format)
		}

		// microformats is ISO YYYY-MM-DDTHH:MM:SS format
		var iso = value.substr(0,4) + "-" + value.substr(4,2) + "-" + value.substr(6,2) 
			+ "T" + value.substr(8,2) + ":" + value.substr(10,2) + ":00";

		var e = createTiddlyElement(place,'abbr',null,null);
		e.setAttribute('title',iso);
		e.setAttribute('class',className);
		createTiddlyText(e,text);
	};
}
//}}}
