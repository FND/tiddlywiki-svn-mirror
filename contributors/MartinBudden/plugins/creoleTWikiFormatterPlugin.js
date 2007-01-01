/***
|''Name:''|creoleTWikiFormatterPlugin|
|''Author:''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins|
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
config.twikiFormatters.push(creoleBaseFormatter.bold);
config.twikiFormatters.push(creoleBaseFormatter.italic);
config.twikiFormatters.push(creoleBaseFormatter.list);
config.twikiFormatters.push(creoleBaseFormatter.heading);
config.twikiFormatters.push(creoleBaseFormatter.explicitLink);
config.twikiFormatters.push(creoleBaseFormatter.preFormattedBlock);


// set up parser to use added formatters
var format = config.parsers.twikiFormatter.format;
var formatTag = config.parsers.twikiFormatter.formatTag;
delete config.parsers.twikiFormatter;
config.parsers.twikiFormatter = new Formatter(config.twikiFormatters);
config.parsers.twikiFormatter.format = format;
config.parsers.twikiFormatter.formatTag = formatTag;

}// end of 'install only once'
//}}}
