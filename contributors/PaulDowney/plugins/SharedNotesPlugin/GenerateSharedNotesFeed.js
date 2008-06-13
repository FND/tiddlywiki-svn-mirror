/***
|''Name:''|GenerateSharedNotesFeedPlugin|
|''Description:''|Generates RSS Feed from set of tiddlers|
|''Version:''|0.0.1|
|''Date:''|April 14, 2008|
|''Source:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/GenerateAtomPlugin|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.0|
|''Browser:''|Firefox 1.0.4+; Firefox 1.5; InternetExplorer 6.0|

TBD: make a better plugin, refactor to use TiddlyTemplating, and Atom is a *much* better format

***/

//{{{

config.macros.GenerateSharedNotesFeed = {};


/*
 *  generate a RSS 2.0 feed from a list of tiddlers
 *  - orignally from RippleRap
 *  - core function saves *all* tiddlers, so this could be moved to the core?
 */
config.macros.GenerateSharedNotesFeed.serialize = function(tiddlers,options)
{
	var s = [];
	var now = new Date();
	if (!options){
		options = {};
	}
	var uri = options.uri || store.getTiddlerText('SiteUrl');

	s.push('<' + '?xml version="1.0"?' + '>');
	s.push('<rss version="2.0">');
	s.push('<channel>');
	s.push('<title' + '>' + 
	wikifyPlain('SiteTitle').htmlEncode() + " - " + wikifyPlain('SiteSubTitle').htmlEncode() + '</title' + '>');
	if(uri) {
		s.push('<link>' + uri.htmlEncode() + '</link>');
	}
	s.push('<description>' + wikifyPlain('SiteSubtitle').htmlEncode() + '</description>');
	s.push('<language>en-us</language>');
	s.push('<pubDate>' + now.toGMTString() + '</pubDate>');
	s.push('<lastBuildDate>' + now.toGMTString() + '</lastBuildDate>');
	s.push('<generator>TiddlyWiki ' + version.major + '.' + version.minor + '.' + version.revision + ' (Notes)</generator>');

	for (var i=0;i<tiddlers.length;i++) {
		var t = tiddlers[i];
		var modifier = options.modifier || t.modifier;
		s.push('<item>');
		s.push('<title' + '>' + t.title.htmlEncode() + '</title' + '>');
		var desc = wikifyStatic(t.text);
		s.push('<description>' + desc.htmlEncode() + '</description>');
		for(var j=0; j<t.tags.length; j++)
			s.push('<category>' + t.tags[j] + '</category>');
		s.push('<link>' + uri + '#' + encodeURIComponent(String.encodeTiddlyLink(t.title)) + '</link>');
		s.push('<pubDate>' + t.modified.toGMTString() + '</pubDate>');
		s.push('<author>' + modifier + '</author>');
		s.push('<wikitext>' + t.text.htmlEncode() + '</wikitext>');
		s.push('</item>');
	}

	s.push('</channel>');
	s.push('</rss>');
	return s.join('\n');
};

//}}}
