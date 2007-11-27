/***
|''Name:''|RssSynchronizerPlugin|
|''Description:''|Synchronizes TiddlyWikis with RSS feeds|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/RssSynchronizerPlugin.js |
|''Version:''|0.0.2|
|''Date:''|Nov 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.RssSynchronizerPlugin) {
version.extensions.RssSynchronizerPlugin = {installed:true};

function RssSynchronizer() {}

RssSynchronizer.prototype.getNotesTiddlersFromRss = function(uri)
{
//#displayMessage("getNotesTiddlersFromRss"+uri);
	var adaptor = new RSSAdaptor();
	var context = {host:uri,adaptor:adaptor};
	return adaptor.getTiddlerList(context,null,RssSynchronizer.getNotesTiddlerListCallback);
};

RssSynchronizer.getNotesTiddlerListCallback = function(context,userParams)
{
//#displayMessage("getNotesTiddlerListCallback");
	var tiddlers = context.tiddlers;
	for(var i=0; i<tiddlers.length; i++) {
		tiddler = tiddlers[i];
		var t = store.fetchTiddler(tiddler.title);
		// if the tiddler exists locally, don't overwrite unless the text is different
		// TEMP CHANGE 20/11/07: if(!t || t.text != tiddler.text) {
		if (!t) {
			store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
			story.refreshTiddler(tiddler.title,1,true);
		}
	}
};

RssSynchronizer.putTiddlersToRss = function(uri,tiddlers)
{
	var rss = RssSynchronizer.generateRss(tiddlers);
	var callback = function(status,params,responseText,uri,xhr) {
		if(status) {
			// PUT is successful, take item out of queue
			displayMessage("successfully PUT");
			//Collection.clear();
		}/* else {
			// PUT failed, deal with it here
			// leave item in queue and take no action?
		}*/
	};
	DAV.safeput(uri,callback,null,rssString);
};

RssSynchronizer.generateRss = function(tiddlers)
{
	var s = [];
	var d = new Date();
	var u = store.getTiddlerText("SiteUrl");
	//# Assemble the header
	s.push("<" + "?xml version=\"1.0\"?" + ">");
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
	//# The body
	for (var i=tiddlers.length-1; i>=0; i--) {
		var t = tiddlers[i];
		var item = t.toRssItem(u);
		if(t.modifier)
			item += "<author>\n" + t.modifier + "\n</author>";
		item += "<tw:wikitext>\n" + t.text + "\n</tw:wikitext>";
		s.push("<item>\n" + item + "\n</item>");
	}
	//# And footer
	s.push("</channel>");
	s.push("</rss>");
	//# Save it all
	return s.join("\n");
};

} //# end of 'install only once'
//}}}
