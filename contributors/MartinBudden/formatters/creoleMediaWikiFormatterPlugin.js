/***
|''Name:''|creoleMediaWikiFormatterPlugin|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/creoleMediaWikiFormatterPlugin.js|
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
config.mediawiki.formatters.push(creoleBaseFormatter.bold);
config.mediawiki.formatters.push(creoleBaseFormatter.italic);
config.mediawiki.formatters.push(creoleBaseFormatter.preFormattedBlock);

var format = config.parsers.mediawikiFormatter.format;
var formatTag = config.parsers.mediawikiFormatter.formatTag;
delete config.parsers.mediaWikiFormatter;
config.parsers.mediawikiFormatter = new Formatter(config.mediawiki.formatters);
config.parsers.mediawikiFormatter.format = format;
config.parsers.mediawikiFormatter.formatTag = formatTag;

}// end of 'install only once'
//}}}
