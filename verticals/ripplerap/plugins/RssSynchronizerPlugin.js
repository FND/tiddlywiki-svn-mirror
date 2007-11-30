/***
|''Name:''|RssSynchronizerPlugin|
|''Description:''|Synchronizes TiddlyWikis with RSS feeds|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/RssSynchronizerPlugin.js |
|''Version:''|0.0.5|
|''Date:''|Nov 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.RssSynchronizerPlugin) {
version.extensions.RssSynchronizerPlugin = {installed:true};

function RssSynchronizer() 
{
	this.sessionDownload = {titles:[],syncIndex:0,getMostRecent:true,mostRecentTitle:'latest',requestPending:false};
	this.userUpload = {requestPending:false};
	this.timerID = null;
}

RssSynchronizer.prototype.timerTest = function()
{
	displayMessage("hello");
	displayMessage("mrt:"+this.sessionDownload.mostRecentTitle);
	
};

RssSynchronizer.prototype.init = function()
{
	var me = this;
	store.forEachTiddler(function(title,t) {
		if(t.isTagged('session') && t.fields.rr_session_date) {
			var s = title;
			me.sessionDownload.titles.push(s);
		}
		if(t.isTagged('systemServer') && t.isTagged('ripplerap')) {
			if(t.isTagged('notes')) {
				var type = store.getTiddlerSlice(t.title,'Type');
				var uri = store.getTiddlerSlice(t.title,'URL');
				if(uri && type=='rss') {
					if(uri.substr(uri.length-1) != '/')
						uri = uri + '/';
					me.sessionDownload.rootUri = uri;
				}
			} else if(t.isTagged('upload')) {
				type = store.getTiddlerSlice(t.title,'Type');
				uri = store.getTiddlerSlice(t.title,'URL');
				if(uri && type=='rss') {
					if(uri.substr(uri.length-1) != '/')
						uri = uri + '/';
					me.userUpload.rootUri = uri;
				}
			}
		}
	});
};

// Do a single sync operation, designed to be called off a timer
// on each call it downl
RssSynchronizer.prototype.doSync = function()
{
	this.sessionDownload.requestPending = true;
	this.userUpload.requestPending = true;
	if(this.sessionDownload.getMostRecent) {
		this.sessionDownload.getMostRecent = false;
		var sessionTitle = this.sessionDownload.mostRecentTitle;
	} else {
		this.sessionDownload.getMostRecent = true;
		sessionTitle = this.sessionDownload.titles[this.sessionDownload.syncIndex];
		this.sessionDownload.syncIndex++;
		if(this.sessionDownload.syncIndex>=this.sessionDownload.titles.length)
			this.sessionDownload.syncIndex = 0;
	}
	var uri = this.sessionDownload.rootUri + sessionTitle + '.xml';
	this.getNotesTiddlersFromRss(uri);
	
	this.doPut();

};

RssSynchronizer.prototype.doPut = function()
{
	if(config.options.txtUserName=="YourName") {
		displayMessage("You have not set up your username");
		return;
	}	
	var tiddlers = store.getTaggedTiddlers('comment');
	uri = this.userUpload.rootUri + config.options.txtUserName+ '/index.xml';
	this.putTiddlersToRss(uri,tiddlers);
};

RssSynchronizer.prototype.getNotesTiddlersFromRss = function(uri)
{
displayMessage("getNotesTiddlersFromRss:"+uri);
	var adaptor = new RSSAdaptor();
	var context = {synchronizer:this,host:uri,adaptor:adaptor};
	return adaptor.getTiddlerList(context,null,RssSynchronizer.getNotesTiddlerListCallback);
};

RssSynchronizer.getNotesTiddlerListCallback = function(context,userParams)
{
//#
displayMessage("getNotesTiddlerListCallback");
	context.synchronizer.sessionDownload.requestPending = false;
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

RssSynchronizer.prototype.putTiddlersToRss = function(uri,tiddlers)
{
displayMessage("putTiddlersToRss:"+uri);
	var rss = RssSynchronizer.generateRss(tiddlers);
	var callback = function(status,context,responseText,uri,xhr) {
displayMessage("putTiddlersToRssCallback:"+status);
		context.synchronizer.sessionDownload.requestPending = false;
		if(status) {
			// PUT is successful, take item out of queue
			displayMessage("successfully PUT");
			//Collection.clear();
		} else {
			displayMessage("PUT failed");
			// PUT failed, deal with it here
			// leave item in queue and take no action?
		}
	};
	DAV.safeput(uri,callback,{synchronizer:this},rss);
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
