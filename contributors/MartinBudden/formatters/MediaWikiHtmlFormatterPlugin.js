/***
|''Name:''|MediaWikiHtmlFormatterPlugin|
|''Description:''|Converts Socialtext wiki format to and from HTML|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#MediaWikiHtmlFormatterPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/MediaWikiHtmlFormatterPlugin.js|
|''Requires''|SocialtextFormatterPlugin|
|''Version:''|0.0.1|
|''Date:''|Mar 24, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

***/

//{{{
// Ensure that the MediaWikiHtmlFormatter Plugin is only installed once.
if(!version.extensions.MediaWikiHtmlFormatterPlugin) {
version.extensions.MediaWikiHtmlFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('MediaWikiHtmlFormatterPlugin requires TiddlyWiki 2.1 or later.');}

config.mediawiki.htmlFormatters = [];
for(var i=0; i<config.mediawiki.formatters.length; i++) {
	switch(config.mediawiki.formatters[i].name) {
	case 'mediaWikiHeading':
	case 'mediaWikiList':
	case 'mediaWikiBold':
	case 'mediaWikiItalic':
	case 'mediaWikiStrike':
	case 'mediaWikiMonoSpaced':
	case 'mediaWikiParagraph':
	case 'mediaWikiLineBreak':
		config.mediawiki.htmlFormatters.push(config.mediawiki.formatters[i]);
		break;
	default:
		break;
	}
}


config.parsers.mediaWikiHtmlFormatter = new Formatter(config.mediawiki.htmlFormatters);
config.parsers.mediaWikiHtmlFormatter.format = 'mediawikihtml';

config.mediawiki.htmlToWiki = function(html)
{
// this is a very primitive converter, just to illustrate the concept
	var t = html.replace(/<strong>/mg,"'''").replace(/<\/strong>/mg,"'''");
	t = t.replace(/<em>/mg,"''").replace(/<\/em>/mg,"''");
	t = t.replace(/<strike>/mg,'<s>').replace(/<\/strike>/mg,'</s>');
	t = t.replace(/<h1>/mg,'=').replace(/<\/h1>/mg,'=');
	t = t.replace(/<h2>/mg,'==').replace(/<\/h2>/mg,'==');
	t = t.replace(/<h3>/mg,'===').replace(/<\/h3>/mg,'===');
	t = t.replace(/<h4>/mg,'====').replace(/<\/h4>/mg,'====');
	t = t.replace(/<h5>/mg,'=====').replace(/<\/h5>/mg,'=====');
	t = t.replace(/<h6>/mg,'======').replace(/<\/h6>/mg,'======');
	t = t.replace(/<span>/mg,'').replace(/<\/span>/mg,'');
	t = t.replace(/<br \/>/mg,'\n');
	t = t.replace(/<p>/mg,'\n\n').replace(/<\/p>/mg,'');
	return t;
};

} // end of 'install only once'
//}}}
