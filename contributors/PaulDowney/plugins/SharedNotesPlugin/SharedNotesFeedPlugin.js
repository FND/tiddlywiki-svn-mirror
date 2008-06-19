/***
|''Name:''|SharedNotesFeedPlugin|
|''Description:''|Generates RSS Feed from set of tiddlers|
|''Version:''|0.0.1|
|''Date:''|April 14, 2008|
|''Source:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SharedNotes|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.0|
|''Browser:''|Firefox 1.0.4+; Firefox 1.5; InternetExplorer 6.0|

TBD: want to move to Atom, but RSS 2.0 is TiddlyWiki default and is now parsed by Confabb

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.SharedNotesFeedPlugin){
version.extensions.SharedNotesFeedPlugin = {installed:true};

config.macros.SharedNotesFeed = {};

/*
 *  generate a RSS 2.0 feed from a list of tiddlers
 */
config.macros.SharedNotesFeed.serialize = function(tiddlers,options)
{
	var me = config.macros.SharedNotesFeed;
	var s = [];
	if (!options){
		options = {};
	}
	if(!options.now){
		options.now = new Date();
	}
	if(!options.uri){
		options.uri= store.getTiddlerText('SiteUrl');
	}
	s.push('<' + '?xml version="1.0"?' + '>');
	s.push('<rss version="2.0" xmlns:tw="http://www.tiddlywiki.com/">');
	s.push('<channel>');
	s.push('<title' + '>' + wikifyPlain('SiteTitle').htmlEncode() + '</title' + '>');
	s.push('<description>' + wikifyPlain('SiteSubtitle').htmlEncode() + '</description>');
	s.push('<pubDate>' + options.now.toUTCString() + '</pubDate>');
	s.push('<lastBuildDate>' + options.now.toUTCString() + '</lastBuildDate>');
	s.push('<link>' + options.uri.htmlEncode() + '</link>');
	s.push('<generator>TiddlyWiki ' + formatVersion() + ' (Notes)</generator>');
	for (var i=0;i<tiddlers.length;i++) {
		var t = tiddlers[i];
		s.push(me.serializeTiddler(tiddlers[i],options));
	}
	s.push('</channel>');
	s.push('</rss>');
	return s.join('\n');
};

config.macros.SharedNotesFeed.serializeTiddler = function(tiddler,options) 
{
	
	log("SERIALIZE TIDDLER : ", tiddler);
	
	if (!options){
		options = {};
	}
	var s = [];
	s.push('<item>');
	s.push('<title' + '>' + tiddler.title.htmlEncode() + '</title' + '>');
	var modifier = options.modifier || tiddler.modifier;
	s.push('<author>' + modifier + '</author>');
	s.push('<description>' + wikifyStatic(tiddler.text).htmlEncode() + '</description>');
	s.push('<tw:wikitext>' + tiddler.text.htmlEncode() + '</tw:wikitext>');
	if(tiddler.fields['rr_session_id']){
		s.push('<category>' + tiddler.fields['rr_session_id'].htmlEncode() + '</category>');
	}
	for(var i=0; i<tiddler.tags.length; i++)
		s.push('<category>' + tiddler.tags[i].htmlEncode() + '</category>');
	s.push('<pubDate>' + tiddler.modified.toUTCString() + '</pubDate>');
	s.push('</item>');
	return s.join('\n');
};



} //# end of 'install only once'
//}}}
