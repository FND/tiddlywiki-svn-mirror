/***
|''Name:''|GenerateRssByTagPlugin|
|''Description:''|Only tiddlers with a specific tag are inluded in the RSSFeed. If no tiddlers are selected then works as before. (see ticket #270: http://trac.tiddlywiki.org/tiddlywiki/ticket/270). <br>RssTag: <<option txtRssTag>>|
|''Version:''|1.0.0|
|''Date:''|Mar 5, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#GenerateRssByTagPlugin|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0 (Changeset 1583)|
|''Browser:''|http://www.tiddlywiki.com/#browsers|
***/
//{{{
version.extensions.GenerateRssByTagPlugin = {
	major: 1, minor: 0, revision: 0, 
	date: new Date("Mar 5, 2007"),
	source: 'http://tiddlywiki.bidix.info/#PasswordOptionPlugin',
	author: 'BidiX (BidiX (at) bidix (dot) info',
	license: '[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D]]',
	coreVersion: '2.2.0 (Changeset 1583)',
	browser: 'Firefox 1.5; InternetExplorer 6.0; Safari'	
};

if (!window.bidix) window.bidix = {}; // bidix namespace

bidix.generateRssByTag = function()
{
	var s = [];
	var d = new Date();
	var u = store.getTiddlerText("SiteUrl");
	// Assemble the header
	s.push("<" + "?xml version=\"1.0\"" + " encoding='UTF-8' " + "?" + ">");
	s.push("<rss version=\"2.0\">");
	s.push("<channel>");
	s.push("<title" + ">" + wikifyPlain("SiteTitle").htmlEncode() + "</title" + ">");
	if(u)
		s.push("<link>" + u.htmlEncode() + "</link>");
	s.push("<description>" + wikifyPlain("SiteSubtitle").htmlEncode() + "</description>");
	s.push("<language>en-us</language>");
	s.push("<copyright>Copyright " + d.getFullYear() + " " + config.options.txtUserName.htmlEncode() + "</copyright>");
	s.push("<pubDate>" + d.toGMTString() + "</pubDate>");
	s.push("<lastBuildDate>" + d.toGMTString() + "</lastBuildDate>");
	s.push("<docs>http://blogs.law.harvard.edu/tech/rss</docs>");
	s.push("<generator>TiddlyWiki " + version.major + "." + version.minor + "." + version.revision + "</generator>");
	// The body
	var tiddlers;
	if (config.options.txtRssTag && store.getTaggedTiddlers(config.options.txtRssTag).length > 0)
		tiddlers = store.getTaggedTiddlers(config.options.txtRssTag,"modified");
	else
	    tiddlers = store.getTiddlers("modified","excludeLists");
	var n = config.numRssItems > tiddlers.length ? 0 : tiddlers.length-config.numRssItems;
	for (var t=tiddlers.length-1; t>=n; t--)
		s.push(tiddlers[t].saveToRss(u));
	// And footer
	s.push("</channel>");
	s.push("</rss>");
	// Save it all
	return s.join("\n");
}

//
// Initializations
//
bidix.generateRss = generateRss; // backup core version
generateRss = bidix.generateRssByTag; // install new one
config.options.txtRssTag = "toRSS";	// default RssTag. <<option txtRssTag>> could be added in AdvancedOptions
//}}}