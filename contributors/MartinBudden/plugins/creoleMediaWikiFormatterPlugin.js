/***
|''Name:''|creoleMediaWikiFormatterPlugin|

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
