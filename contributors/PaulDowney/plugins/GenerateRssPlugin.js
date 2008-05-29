/***
|''Name:''|GenerateRssPlugin|
|''Description:'generate RSS from set of tiddlers'|HTML||
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

GenerateRss = {};

/*
 *  generate a RSS 2.0 feed from a list of tiddlers
 *  - orignally from RippleRap
 *  - core function saves *all* tiddlers, so this could be moved to the core?
 */
GenerateRss.serialize = function(tiddlers,uri)
{
	var s = [];
	var now = new Date();
	var uri = uri || store.getTiddlerText('SiteUrl');

	s.push('<' + '?xml version="1.0"?' + '>');
	s.push('<rss version="2.0">');
	s.push('<channel>');
	s.push('<title' + '>' + wikifyPlain('SiteTitle').htmlEncode() + '</title' + '>');
	if(uri) {
		s.push('<link>' + uri.htmlEncode() + '</link>');
	}
	s.push('<description>' + wikifyPlain('SiteSubtitle').htmlEncode() + '</description>');
	s.push('<language>en-us</language>');
	s.push('<copyright>Copyright ' + now.getFullYear() + ' ' + config.options.txtUserName.htmlEncode() + '</copyright>');
	s.push('<pubDate>' + now.toGMTString() + '</pubDate>');
	s.push('<lastBuildDate>' + now.toGMTString() + '</lastBuildDate>');
	s.push('<docs>http://blogs.law.harvard.edu/tech/rss</docs>');
	s.push('<generator>TiddlyWiki ' + version.major + '.' + version.minor + '.' + version.revision + ' (Notes)</generator>');
	//# The body
	for (var i=0;i<tiddlers.length;i++) {
		var t = tiddlers[i];
		s.push('<item>');
		s.push('<title' + '>' + t.title.htmlEncode() + '</title' + '>');
		s.push('<description>' + t.text.htmlEncode() + '</description>');
		for(var j=0; j<t.tags.length; j++)
			s.push('<category>' + t.tags[j] + '</category>');
		s.push('<link>' + uri + '#' + encodeURIComponent(String.encodeTiddlyLink(t.title)) + '</link>');
		s.push('<pubDate>' + t.modified.toGMTString() + '</pubDate>');
		s.push('<author>' + t.modifier + '</author>');
		s.push('</item>');
		/*var item = t.toRssItem(u);
		if(t.modifier)
			item += '\n<author>' + t.modifier + '</author>\n';
		item += '<tw:wikitext>\n' + t.text..htmlEncode() + '\n</tw:wikitext>';
		s.push('<item>\n' + item + '\n</item>');*/
	}
	//# And footer
	s.push('</channel>');
	s.push('</rss>');
	//# Save it all
	return s.join('\n');
};

//}}}
