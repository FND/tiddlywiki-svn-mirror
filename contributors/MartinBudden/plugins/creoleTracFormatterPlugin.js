/***
|''Name:''|creoleTracFormatterPlugin|
|''Author:''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins|
|''Version:''|0.0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

Adds the following to Trac, to make it Creole compliant:

# {{{**}}} bold
# {{{//}}} italic
# {{{*}}} unordered and {{{#}}} ordered lists

***/

//{{{
if(!version.extensions.creoleTracFormatterPlugin) {
version.extensions.creoleTracFormatterPlugin = {installed:true};
if(version.major < 2 || (version.major == 2 && version.minor < 1)) {
	alertAndThrow("creoleTracFormatterPlugin requires TiddlyWiki 2.1 or later.");
}

// add new formatters
config.tracFormatters.push(creoleBaseFormatter.bold);
config.tracFormatters.push(creoleBaseFormatter.italic);
config.tracFormatters.push(creoleBaseFormatter.list);
config.tracFormatters.push(creoleBaseFormatter.explicitLink);


// set up parser to use added formatters
var format = config.parsers.tracFormatter.format;
var formatTag = config.parsers.tracFormatter.formatTag;
delete config.parsers.tracFormatter;
config.parsers.tracFormatter = new Formatter(config.tracFormatters);
config.parsers.tracFormatter.format = format;
config.parsers.tracFormatter.formatTag = formatTag;

}// end of 'install only once'
//}}}
