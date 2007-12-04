/***
|''Name:''|RssSynchronizerPlugin|
|''Description:''|Synchronizes TiddlyWikis with RSS feeds|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/RssSynchronizerPlugin.js |
|''Version:''|0.0.10|
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
	this.userUpload.time = new Date();
	this.userUpload.time.setFullYear(2000); // to force first time put

	this.timerID = null;
	this.timerInterval = 10000;

	this.nextIsGet = true;
	this.discoveredNoteTag = config.macros.TiddlerDisplayDependencies.discoveredNoteTag;
	this.myNoteTag = config.macros.TiddlerDisplayDependencies.myNoteTag;
	this.sessionTag = config.macros.TiddlerDisplayDependencies.sessionTag;
	
	this.sharedTag = 'shared';
}

RssSynchronizer.userNameNotSet = "You have not set your username";

RssSynchronizer.prototype.init = function()
{
	var me = this;
	store.forEachTiddler(function(title,t) {
		if(t.isTagged('session') && t.fields.rr_session_date) {
			var s = title.replace(/[^\w]/g,'_');
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
RssSynchronizer.prototype.makeRequest = function()
{
	if(!config.options.chkRipplerapShare)
		return;
	if(this.userUpload.requestPending) {
console.log("put request is pending");
		return;
	}
	if(this.sessionDownload.requestPending) {
console.log("get request is pending");
		return;
	}
console.log(this.nextIsGet ? "makeRequest:get" : "makeRequest:put");
	this.nextIsGet = !this.nextIsGet;
	var me = this;
	if(this.nextIsGet) {
		this.userUpload.requestPending = true;
		window.setTimeout(function() {me.doPut.call(me);},this.timerInterval);
	} else {
		this.sessionDownload.requestPending = true;
		window.setTimeout(function() {me.doGet.call(me);},this.timerInterval);
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
	} else {
		this.sessionDownload.getMostRecent = true;
		sessionTitle = this.sessionDownload.titles[this.sessionDownload.syncIndex];
		this.sessionDownload.syncIndex++;
		if(this.sessionDownload.syncIndex>=this.sessionDownload.titles.length)
			this.sessionDownload.syncIndex = 0;
	}
	var uri = this.sessionDownload.rootUri + sessionTitle + '.xml';
	this.getNotesTiddlersFromRss(uri);
};

RssSynchronizer.prototype.getNotesTiddlersFromRss = function(uri)
{
console.log("getNotesTiddlersFromRss:"+uri);
	var adaptor = new RSSAdaptor();
	var context = {synchronizer:this,host:uri,adaptor:adaptor,rssUseRawDescription:true};
	var ret = adaptor.getTiddlerList(context,null,RssSynchronizer.getNotesTiddlerListCallback);
console.log("getTiddlerList:"+ret);
	return ret;
};

RssSynchronizer.getNotesTiddlerListCallback = function(context,userParams)
{
console.log("getNotesTiddlerListCallback:"+context.status);
	//context.synchronizer.sessionDownload.requestPending = false;
	var tiddlers = context.tiddlers;
	var length = tiddlers ? tiddlers.length : 0;
	var me = context.synchronizer;
	for(var i=0; i<length; i++) {
		tiddler = tiddlers[i];
		//var t = store.fetchTiddler(tiddler.title);
		// if the tiddler exists locally, don't overwrite unless the text is different
		// TEMP CHANGE 20/11/07: if(!t || t.text != tiddler.text) {
		//if(!t || t.text != tiddler.text) {
		if(tiddler.modifier!=config.options.txtUserName) {
			tiddler.tags.pushUnique(me.discoveredNoteTag);
			tiddler.tags.remove(me.sharedTag);
			tiddler.tags.remove(me.myNoteTag);
		console.log("Tags: " + tiddler.tags + ", modifier: "+ tiddler.modifier);
			store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
			story.refreshTiddler(tiddler.title,1,true);
		}
	}
	me.sessionDownload.requestPending = false;
	me.makeRequest.call(me);
};



// If the user has written any notes since the last put, then put them
RssSynchronizer.prototype.doPut = function()
{
console.log("doPut");
	if(config.options.txtUserName=='YourName') {
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
console.log("putRequired");
		uri = this.userUpload.rootUri + config.options.txtUserName+ '/index.xml';
		this.putTiddlersToRss(uri,tiddlers);
	} else {
console.log("putNotRequired");
		this.userUpload.requestPending = false;
		this.makeRequest();
	}
	return putRequired;
};

RssSynchronizer.prototype.putTiddlersToRss = function(uri,tiddlers)
{
console.log("putTiddlersToRss:"+uri);
	this.userUpload.startTime = new Date();
	var rss = RssSynchronizer.generateRss(tiddlers);
	
	var callback = function(status,params,responseText,uri,xhr) {
console.log("putTiddlersToRssCallback:"+status);
		var context = params[0];
		var me = context.synchronizer;
		me.userUpload.requestPending = false;
		if(status) {
			// PUT is successful, reset the time
			me.userUpload.time = me.userUpload.startTime;
			displayMessage("successfully PUT");
			//Collection.clear();
		} else {
			displayMessage("PUT failed");
			// PUT failed, deal with it here
			// leave item in queue and take no action?
		}
		me.makeRequest.call(me);
	};

	var context = {};
	context.synchronizer = this;
	DAV.safeput(uri,callback,[context],rss);
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
	s.push('<generator>TiddlyWiki (RSS Synchronizer)' + version.major + '.' + version.minor + '.' + version.revision + '</generator>');
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
