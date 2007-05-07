/***
|''Name:''|SocialtextHtmlFormatterPlugin|
|''Description:''|Converts Socialtext wiki format to and from HTML|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#SocialtextHtmlFormatterPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/SocialtextHtmlFormatterPlugin.js |
|''Requires''|SocialtextFormatterPlugin|
|''Version:''|0.0.2|
|''Date:''|May 7, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

***/

//{{{
// Ensure that the SocialtextHtmlFormatter Plugin is only installed once.
if(!version.extensions.SocialtextHtmlFormatterPlugin) {
version.extensions.SocialtextHtmlFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('SocialtextHtmlFormatterPlugin requires TiddlyWiki 2.1 or later.');}

SocialtextFormatter.noWikiHtml = {
	name: 'socialtextNoWikiHtml',
	match: '\\{\\{',
	lookaheadRegExp: /(\{\{(?:.|\n)*?\}\})/mg,
	element: 'span',
	handler: config.formatterHelpers.enclosedTextHelper
};

config.socialtext.htmlFormatters = [];
for(var i=0; i<config.socialtext.formatters.length; i++) {
	switch(config.socialtext.formatters[i].name) {
	case 'socialtextList':
	case 'socialtextBold':
	case 'socialtextItalic':
	case 'socialtextStrike':
	case 'socialtextMonoSpaced':
	case 'socialtextParagraph':
	case 'socialtextLineBreak':
		config.socialtext.htmlFormatters.push(config.socialtext.formatters[i]);
		break;
	default:
		break;
	}
}

config.socialtext.htmlFormatters.push(SocialtextFormatter.noWikiHtml);

config.parsers.socialtextHtmlFormatter = new Formatter(config.socialtext.htmlFormatters);
config.parsers.socialtextHtmlFormatter.format = 'socialtexthtml';

config.socialtext.htmlToWiki = function(html)
{
// this is a very primitive converter, just to illustrate the concept
	var t = html.replace(/<strong>/mg,'*').replace(/<\/strong>/mg,'*');
	t = t.replace(/<em>/mg,'_').replace(/<\/em>/mg,'_');
	t = t.replace(/<del>/mg,'-').replace(/<\/del>/mg,'-');
	t = t.replace(/<tt>/mg,'`').replace(/<\/tt>/mg,'`');
	t = t.replace(/<span>/mg,'').replace(/<\/span>/mg,'');
	t = t.replace(/<p>/mg,'\n\n').replace(/<\/p>/mg,'');
	t = t.replace(/<br \/>/mg,'\n');
	t = t.replace(/&nbsp;/mg,'');
	return t;
};

} // end of 'install only once'
//}}}
