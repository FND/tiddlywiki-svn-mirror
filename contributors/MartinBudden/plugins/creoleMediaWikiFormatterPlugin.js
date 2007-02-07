/***
|''Name:''|creoleMediaWikiFormatterPlugin|
|''Author:''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins|
|''Version:''|0.0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

Adds the following to MediaWiki, to make it Creole compliant:

# {{{**}}} bold
# {{{//}}} italic
# preformatted block

***/

//{{{
if(!version.extensions.creoleMediaWikiFormatterPlugin) {
version.extensions.creoleMediaWikiFormatterPlugin = {installed:true};
if(version.major < 2 || (version.major == 2 && version.minor < 1)) {
	alertAndThrow("creoleMediaWikiFormatterPlugin requires TiddlyWiki 2.1 or later.");
}

// add new formatters
config.mediaWikiFormatters.push(creoleBaseFormatter.bold);
config.mediaWikiFormatters.push(creoleBaseFormatter.italic);
config.mediaWikiFormatters.push(creoleBaseFormatter.preFormattedBlock);

var format = config.parsers.mediaWikiFormatter.format;
var formatTag = config.parsers.mediaWikiFormatter.formatTag;
delete config.parsers.mediaWikiFormatter;
config.parsers.mediaWikiFormatter = new Formatter(config.mediaWikiFormatters);
config.parsers.mediaWikiFormatter.format = format;
config.parsers.mediaWikiFormatter.formatTag = formatTag;

}// end of 'install only once'
//}}}
