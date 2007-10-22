/***
|''Name:''|creoleTWikiFormatterPlugin|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/creoleTWikiFormatterPlugin.js|
|''Version:''|0.0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

Adds the following to TWiki, to make it Creole compliant:

# {{{**}}} bold
# {{{//}}} italic
# {{{*}}} unordered and {{{#}}} ordered lists
# explicit links
# preformatted blocks

***/

//{{{
if(!version.extensions.creoleTWikiFormatterPlugin) {
version.extensions.creoleTWikiFormatterPlugin = {installed:true};
if(version.major < 2 || (version.major == 2 && version.minor < 1)) {
	alertAndThrow("creoleTWikiFormatterPlugin requires TiddlyWiki 2.1 or later.");
}

// add new formatters
config.twiki.formatters.push(creoleBaseFormatter.bold);
config.twiki.formatters.push(creoleBaseFormatter.italic);
config.twiki.formatters.push(creoleBaseFormatter.list);
config.twiki.formatters.push(creoleBaseFormatter.heading);
config.twiki.formatters.push(creoleBaseFormatter.explicitLink);
config.twiki.formatters.push(creoleBaseFormatter.preFormattedBlock);


// set up parser to use added formatters
var format = config.parsers.twikiFormatter.format;
var formatTag = config.parsers.twikiFormatter.formatTag;
delete config.parsers.twikiFormatter;
config.parsers.twikiFormatter = new Formatter(config.twikiFormatters);
config.parsers.twikiFormatter.format = format;
config.parsers.twikiFormatter.formatTag = formatTag;

}// end of 'install only once'
//}}}
