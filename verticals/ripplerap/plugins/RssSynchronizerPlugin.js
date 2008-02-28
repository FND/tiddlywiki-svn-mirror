/***
|''Name:''|RssSynchronizerPlugin|
|''Description:''|Synchronizes TiddlyWikis with RSS feeds|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/RssSynchronizerPlugin.js |
|''Version:''|0.0.16|
|''Date:''|Nov 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|

!!Description

This plugin uses the RSSAdaptor and WebDavLib to periodically:
# download tiddlers from the specified download feed
# upload user notes to the speficied upload feed

The feeds are standard TiddlyWiki feeds (that is tiddlers tagged "systemServer) that are additionally tagged with "ripplerap"
and either "notes" "upload" or "updates". "notes" specifies the root uri of where from which other are downloaded. "upload" speficies
the uri where the user's notes are uploaded. "updates" specifies the uri of the conference agenda, this feed is used to make any
last minute changes to the conference agenda.

!!Usage

Set up the "note", "upload" and "updates" feeds.

Requires the RSS Adaptor: http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/adaptors/RSSAdaptor.js
Requires WebDavLib: http://svn.tiddlywiki.org/Trunk/contributors/SaqImtiaz/plugins/WebDavLib.js

If required, set config.options.txtRippleRapInterval (in seconds). Default is 60 seconds.

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.RssSynchronizerPlugin) {
version.extensions.RssSynchronizerPlugin = {installed:true};

if(!config.options.txtRippleRapInterval)
	{config.options.txtRippleRapInterval = 60;}

config.optionsDesc.txtRippleRapInterval = "~RippleRap synchronization interval (in seconds)";

merge(config.messages,{
	polling:"Polling server...",
	contentDownloading:"New content being downloaded",
	xhrTimeout:"No web connection available - unable to download content",
	xhrError:"Problem with sending the XMLHttpRequest (if you are using Firebug, turn off network monitoring",
	downloadComplete:"Download complete!"
});
	
function RssSynchronizer() 
{
	this.sessionDownload = {titles:[],syncIndex:0,getMostRecent:true,mostRecentTitle:'latest',requestPending:false};

	this.userUpload = {requestPending:false};
	this.userUpload.time = new Date();
	this.userUpload.time.setFullYear(2000); // to force first time put

	this.updates = {};

	this.timerID = null;

	this.nextIsGet = true;
	this.discoveredNoteTag = config.macros.TiddlerDisplayDependencies.discoveredNoteTag;
	this.myNoteTag = config.macros.TiddlerDisplayDependencies.myNoteTag;
	this.sessionTag = config.macros.TiddlerDisplayDependencies.sessionTag;
	
	this.sharedTag = 'shared';
}

RssSynchronizer.userNameNotSet = "You have not set your username";

// logging function, for debug
RssSynchronizer.log = function(x)
{
	if(!config.options.chkDisplayStartupTime)// reuse this flag for now
		return;
	if(window.console)
		console.log(x);
	else
		displayMessage(x);
};

RssSynchronizer.prototype.init = function()
{
	var me = this;
	store.forEachTiddler(function(title,t) {
		//# add in the session tiddlers
		if(t.isTagged('session') && t.fields.rr_session_starttime) {
			var s = title.replace(/[^\w]/g,'_');
			//#if(me.sessionDownload.titles.length<3)// for debug
			me.sessionDownload.titles.push(s);
		}
		//# add in the feeds
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
			} else if(t.isTagged('updates')) {
				type = store.getTiddlerSlice(t.title,'Type');
				uri = store.getTiddlerSlice(t.title,'URL');
				if(uri && type=='rss') {
					me.updates.uri = uri;
				}
			}
		}
	});
	if(config.options.chkRipplerapShare) {
		this.makeRequest();
	}
};

RssSynchronizer.prototype.getInterval = function()
{
	var t = config.options.txtRippleRapInterval ? parseInt(config.options.txtRippleRapInterval)*1000 : 60000;
	if(isNaN(t))
		t = 60000;
	return t;
};

// If no sync requests are outstanding then queue a sync request on a timer.
// Alternates between upload and download requests.
RssSynchronizer.prototype.makeRequest = function()
{
	if(!config.options.chkRipplerapShare)
		return;
	if(this.userUpload.requestPending) {
RssSynchronizer.log("put request is pending");
		return;
	}
	if(this.sessionDownload.requestPending) {
RssSynchronizer.log("get request is pending");
		return;
	}
RssSynchronizer.log(this.nextIsGet ? "makeRequest:get" : "makeRequest:put");
	this.nextIsGet = !this.nextIsGet;
	var me = this;
	if(this.nextIsGet) {
		this.userUpload.requestPending = true;
		window.setTimeout(function() {me.doPut.call(me);},this.getInterval());
	} else {
		this.sessionDownload.requestPending = true;
		window.setTimeout(function() {me.doGet.call(me);},this.getInterval());
	}
};

RssSynchronizer.prototype.doSync = function()
{
	this.doGet();
	this.doPut();
};

RssSynchronizer.prototype.doGet = function()
{
	if(this.sessionDownload.getMostRecent) {
		this.sessionDownload.getMostRecent = false;
		var sessionTitle = this.sessionDownload.mostRecentTitle;
		var uri = this.sessionDownload.rootUri + sessionTitle + '.xml';
	} else {
		this.sessionDownload.getMostRecent = true;
		if(this.sessionDownload.syncIndex==-1) {
			uri = this.updates.uri;
		}else {
			sessionTitle = this.sessionDownload.titles[this.sessionDownload.syncIndex];
			uri = this.sessionDownload.rootUri + sessionTitle + '.xml';
		}
		this.sessionDownload.syncIndex++;
		if(this.sessionDownload.syncIndex>=this.sessionDownload.titles.length)
			this.sessionDownload.syncIndex = this.updates.uri ? -1 : 0; // set to -1 for the updates uri, if it exists
	}
	var ret = this.getNotesTiddlersFromRss(uri);
	if(typeof ret == "string") {
		if(ret == "timeout") {
			clearMessage();
			displayMessage(config.messages.xhrTimeout);
		} else if (window.console) {
			clearMessage();
			displayMessage(config.messages.xhrError);
		}
	} else {
		clearMessage();
		displayMessage(config.messages.contentDownloading);
	}
};

RssSynchronizer.prototype.getNotesTiddlersFromRss = function(uri)
{
RssSynchronizer.log("getNotesTiddlersFromRss:"+uri);
	var adaptor = new RSSAdaptor();
	var context = {synchronizer:this,host:uri,adaptor:adaptor,rssUseRawDescription:true};
	clearMessage();
	displayMessage(config.messages.polling);
	var ret = adaptor.getTiddlerList(context,null,RssSynchronizer.getNotesTiddlerListCallback);
RssSynchronizer.log("getTiddlerList:"+ret);
	return ret;
};

RssSynchronizer.getNotesTiddlerListCallback = function(context,userParams)
{
RssSynchronizer.log("getNotesTiddlerListCallback:"+context.status);
	//context.synchronizer.sessionDownload.requestPending = false;
	var tiddlers = context.tiddlers;
	var length = tiddlers ? tiddlers.length : 0;
	var me = context.synchronizer;
	store.suspendNotifications();
	for(var i=0; i<length; i++) {
		tiddler = tiddlers[i];
		var t = store.fetchTiddler(tiddler.title);
		//# if the notes tiddler doesn't exist, or it is written by someone else, then get it
		if(!t || tiddler.modifier!=config.options.txtUserName) {
			if(tiddler.modifier!=config.options.txtUserName) {
				tiddler.tags.pushUnique(me.discoveredNoteTag);
				tiddler.tags.remove(me.myNoteTag);
				tiddler.tags.remove(me.sharedTag);
			}
			store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		}
	}
	displayMessage(config.messages.downloadComplete);
	store.resumeNotifications();
	refreshDisplay();
	me.sessionDownload.requestPending = false;
	me.makeRequest.call(me);
};



// If the user has written any notes since the last put, then put them
RssSynchronizer.prototype.doPut = function()
{
RssSynchronizer.log("doPut");
	if(config.options.txtUserName=='YourName') {
		this.userUpload.requestPending = false;
		displayMessage(RssSynchronizer.userNameNotSet);
		return false;
	}
	var putRequired = false;
	var tiddlers = [];
	var me = this;
	store.forEachTiddler(function(title,t) {
		if(t.isTagged(me.myNoteTag) && t.isTagged(me.sharedTag)) {
			tiddlers.push(t);
			if(t.modified > me.userUpload.time)
				putRequired = true;
		}
	});
	if(putRequired) {
RssSynchronizer.log("putRequired");
		uri = this.userUpload.rootUri + config.options.txtUserName+ '/index.xml';
		this.putTiddlersToRss(uri,tiddlers);
	} else {
RssSynchronizer.log("putNotRequired");
		this.userUpload.requestPending = false;
		this.makeRequest();
	}
	return putRequired;
};

RssSynchronizer.prototype.putTiddlersToRss = function(uri,tiddlers)
{
RssSynchronizer.log("putTiddlersToRss:"+uri);
	this.userUpload.startTime = new Date();
	var rss = RssSynchronizer.generateRss(tiddlers);
	
	var callback = function(status,params,responseText,uri,xhr) {
RssSynchronizer.log("putTiddlersToRssCallback:"+status);
		var context = params[0];
		var me = context.synchronizer;
		me.userUpload.requestPending = false;
		if(status) {
			// PUT is successful, reset the time
			me.userUpload.time = me.userUpload.startTime;
			//displayMessage("successfully PUT");
			//Collection.clear();
		} else {
			// displayMessage("PUT failed");
			// PUT failed, deal with it here
			// leave item in queue and take no action?
		}
		me.makeRequest.call(me);
	};

	var context = {};
	context.synchronizer = this;
	DAV.safeput(uri,callback,[context],rss,null,config.options.txtUserName,config.options.txtRipplerapAccountPassword);
};

RssSynchronizer.generateRss = function(tiddlers)
{
	var s = [];
	var d = new Date();
	var u = store.getTiddlerText('SiteUrl');
	//# Assemble the header
	s.push('<' + '?xml version="1.0"?' + '>');
	s.push('<rss version="2.0">');
	s.push('<channel>');
	s.push('<title' + '>' + wikifyPlain('SiteTitle').htmlEncode() + '</title' + '>');
	if(u)
		s.push('<link>' + u.htmlEncode() + '</link>');
	s.push('<description>' + wikifyPlain('SiteSubtitle').htmlEncode() + '</description>');
	s.push('<language>en-us</language>');
	s.push('<copyright>Copyright ' + d.getFullYear() + ' ' + config.options.txtUserName.htmlEncode() + '</copyright>');
	s.push('<pubDate>' + d.toGMTString() + '</pubDate>');
	s.push('<lastBuildDate>' + d.toGMTString() + '</lastBuildDate>');
	s.push('<docs>http://blogs.law.harvard.edu/tech/rss</docs>');
	s.push('<generator>TiddlyWiki ' + version.major + '.' + version.minor + '.' + version.revision + ' (RSS Synchronizer)</generator>');
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

rssSynchronizer = new RssSynchronizer();
rssSynchronizer.init();
	
} //# end of 'install only once'
//}}}
