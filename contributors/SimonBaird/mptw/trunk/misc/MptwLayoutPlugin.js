/***
| Name|MptwLayoutPlugin|
| Description|A package containing templates and css for the MonkeyPirateTiddlyWiki layout|
| Version|3.0 ($Rev$)|
| Source|http://mptw.tiddlyspot.com/#MptwLayoutPlugin|
| Author|Simon Baird <simon.baird@gmail.com>|
| License|http://mptw.tiddlyspot.com/#TheBSDLicense|
!Notes
Presumes you have TagglyTaggingPlugin installed. To enable this you should have a PageTemplate containing {{{[[MptwPageTemplate]]}}} and similar for ViewTemplate and EditTemplate.
***/
//{{{
// used in MptwViewTemplate
config.mptwDateFormat = 'DD/MM/YY';
config.mptwJournalFormat = 'Journal DD/MM/YY';
//config.mptwDateFormat = 'MM/0DD/YY';
//config.mptwJournalFormat = 'Journal MM/0DD/YY';

config.shadowTiddlers.GettingStarted += "\n\nSee also MonkeyPirateTiddlyWiki.";

merge(config.annotations,{
	MptwEditTemplate: "Contains the default MPTW EditTemplate. If you want to customise this rename it to EditTemplate",
	MptwViewTemplate: "Contains the default MPTW ViewTemplate. If you want to customise this rename it to ViewTemplate",
	MptwPageTemplate: "Contains the default MPTW PageTemplate. If you want to customise this rename it to PageTemplate",
	MptwStyleSheet:   "Contains the default MPTW ~StyleSheet. Designed to be included in StyleSheet tiddler using the double square bracketted notation like this: {{{[[MptwStyleSheet]]}}}"
});

//}}}

