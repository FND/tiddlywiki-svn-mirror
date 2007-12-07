/***
|''Name:''|RSSAdaptor|
|''Description:''|Adaptor for talking to RSS 2.0 files|
|''Author''|Jon Lister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/adaptors/RSSAdaptor.js |
|''Version:''|0.1.3|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|
***/

//{{{
if(!version.extensions.RSSAdaptor) {
version.extensions.RSSAdaptor = {installed:true};

function RSSAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

RSSAdaptor.NotLoadedError = "RSS file has not been loaded";
RSSAdaptor.serverType = 'rss';

RSSAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = RSSAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

RSSAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	//if(host.substr(-1) != '/')
	//	host = host + '/';
	return host;
};

RSSAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
//#displayMessage("openHost");
	this.host = RSSAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

RSSAdaptor.loadRssCallback = function(status,context,responseText,url,xhr)
{
//#console.log("loadRssCallback:"+status);
	context.status = status;
	if(!status) {
		context.statusText = "Error reading RSS file";// + xhr.statusText;
	} else {
		try {
			context.tiddlers = RSSAdaptor.rssToTiddlers(responseText,context.rssUseRawDescription);
			/*if(context.filter) {
				var tw = new TiddlyWiki();
				tw.tiddlers = tiddlers;
				tiddlers = tw.filterTiddlers(filter);
			}*/
		} catch (ex) {
			displayMessage("Error parsing RSS:"+context.host);
		}
	}
	context.complete(context,context.userParams);
};

// Gets the list of workspaces on a given server
//# Sets context.workspaces, which contains a single default workspace, since RSS files do not have workspaces
//# Returns true if successful, error string if not
RSSAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.workspaces = [{title:"(default)"}];
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

// Open the specified workspace
//# Returns true if successful, error string if not (or it should)
//# Trivial in the case of RSS file where we don't have a workspace
RSSAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

// Gets the list of tiddlers within a given workspace
//# Returns true if successful, error string if not
//# Sets context.tiddlers, which is an array of tiddlers. Each tiddler corresponds to an RSS item
//# Set these variables if possible:
//# title: tiddler.title, modified: tiddler.modified, modifier: tiddler.modifier, text: tiddler.text, tags: tiddler.tags, size: tiddler.text
RSSAdaptor.prototype.getTiddlerList = function(context,userParams,callback,filter)
{
//#console.log("RSS getTiddlerList");
	context = this.setContext(context,userParams,callback);
//#displayMessage("h:"+context.host);
	if(!context.filter)
		context.filter = filter;
	context.complete = RSSAdaptor.getTiddlerListComplete;
	if(context.tiddlers) {
		var ret = context.complete(context,context.userParams);
	} else {
		ret = loadRemoteFile(context.host,RSSAdaptor.loadRssCallback,context);
		if(typeof ret != "string")
			ret = true;
	}
	return ret;
};

RSSAdaptor.getTiddlerListComplete = function(context,userParams)
{
//#console.log("RSS getTiddlerListComplete");
	context.status = true;
	if(context.callback)
		window.setTimeout(function() {context.callback(context,userParams);},10);
	return true;
};

RSSAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	info.uri = tiddler.fields['server.host'] + "#" + tiddler.title;
	return info;
};

RSSAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#displayMessage("getTiddler:"+title);
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.complete = RSSAdaptor.getTiddlerComplete;
	return context.tiddlers ? 
		context.complete(context,context.userParams) :
		loadRemoteFile(context.host,RSSAdaptor.loadRssCallback,context);
};

RSSAdaptor.getTiddlerComplete = function(context,userParams)
{
	//# Retrieve the tiddler from the this.context.tiddlers array
	for(var i=0; i<context.tiddlers.length; i++) {
		if(context.tiddlers[i].title == context.title) {
			context.tiddler = context.tiddlers[i];
			break;
		}
	}
	if(context.tiddler) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = "error retrieving tiddler: " + title;
		return context.statusText;
	}
	if(context.allowSynchronous) {
		context.isSynchronous = true;
		context.callback(context,userParams);
	} else {
		window.setTimeout(function() {context.callback(context,userParams);},10);
	}
	return true;
};

RSSAdaptor.prototype.close = function()
{
};

RSSAdaptor.rssToTiddlers = function(rss,useRawDescription)
{
//#displayMessage("rssToTiddlers:"+rss.substr(0,500));
	var tiddlers = [];
	rss = rss.replace(/\r+/mg,"");
	// regex_item matches on the items 
	var regex_item = /<item>(.|\n)*?<\/item>/mg;
	// regex_title matches for the titles
	var regex_title = /<title>(.|\n)*?<\/title>/mg;
	var regex_guid = /<guid>(.|\n)*?<\/guid>/mg;
	var regex_wiki = /<tw:wikitext>(.|\n)*?<\/tw:wikitext>/mg;
	var regex_desc = /<description>(.|\n)*?<\/description>/mg;
	var regex_category = /<category>(.|\n)*?<\/category>/mg;
	var regex_link = /<link>(\S|\n)*?<\/link>/mg;
	var regex_pubDate = /<pubDate>(.|\n)*?<\/pubDate>/mg;
	var regex_author = /<author>(.|\n)*?<\/author>/mg;
	var item_match = rss.match(regex_item);
	for(var i=0;i<item_match.length;i++) {
		// create a new Tiddler in context.tiddlers with the finished item object
		// grab a title
		var item = {};
		var title = item_match[i].match(regex_title);
		if(title) {
			item.title = title[0].replace(/^<title>|<\/title>$/mg,"");
		} else {
			// something went wrong grabbing the title, grab the guid instead
			title = item_match[i].match(regex_guid);
			// TEMP FIX FOR DEMO 21/11/07
			if(title) {
				item.title = title[0].replace(/^<guid>|<\/guid>$/mg,"");
			} else {
				item.title = new Date();
				displayMessage("problem with getting title AND guid: " + item_match[i]);
			}
		}
		// This line makes sure any html-encoding in the title is reversed
		item.title = item.title.htmlDecode();
		// There is a problem with the title, which is that it is not formatted, so characters like &apos; are not converted at render time
		// renderHtmlText() extends String and sorts out the problem
		item.title = item.title.renderHtmlText();
		var t = new Tiddler(item.title);

		// grab original wikitext if it is there as an extended field
		var wikitext = item_match[i].match(regex_wiki);
		if(wikitext) {
			item.text = wikitext[0].replace(/^<tw:wikitext>|<\/tw:wikitext>$/mg,"");
			item.text = item.text.htmlDecode();
			t.text = item.text;
		} else {
			// use the description as the tiddler text
			var desc = item_match[i].match(regex_desc);
			if(desc) {
				item.text = desc[0].replace(/^<description>|<\/description>$/mg,"");
			} else {
				item.text = "empty, something seriously wrong with this item";
			}
			t.text = useRawDescription ? item.text.renderHtmlText() : "<html>" + item.text.renderHtmlText() + "</html>";
		}

		// grab the categories
		var category = item_match[i].match(regex_category);
		if(category) {
			item.categories = [];
			for(var j=0;j<category.length;j++) {
				item.categories[j] = category[j].replace(/^<category>|<\/category>$/mg,"");
			}
			t.tags = item.categories;
		}

		// grab the link and put it in a custom field (assumes this is sensible)
		// regex_link assumes you can never have whitespace in a link
		var link = item_match[i].match(regex_link);
		if(link) {
			item.link = link[0].replace(/^<link>|<\/link>$/mg,"");
		} else {
			item.link = "#";
		}
		t.fields["linktooriginal"] = item.link;

		// grab date created
		var pubDate = item_match[i].match(regex_pubDate);
		if(pubDate) {
			pubDate = pubDate[0].replace(/^<pubDate>|<\/pubDate>$/mg,"");
			item.pubDate = new Date(pubDate);
		} else {
			item.pubDate = new Date();
		}
		t.created = item.pubDate;

		// grab author
		var author = item_match[i].match(regex_author);
		if(author) {
			author = author[0].replace(/^<author>|<\/author>$/mg,"");
			item.author = author;
		} else {
			item.author = "anonymous";
		}
		t.modifier = item.author;
		tiddlers.push(t);
		}
	return tiddlers;
};

config.adaptors[RSSAdaptor.serverType] = RSSAdaptor;

// renderHtmlText puts a string through the browser render process and then extracts the text
// useful to turn HTML entities into literals such as &apos; to '
// this method has two passes at the string - the first to convert it to html and the second
// to selectively catch the ASCII-encoded characters without losing the rest of the html
String.prototype.renderHtmlText = function() {
	var text = this;
	var regex_cdata = /<!\[CDATA\[((?:.| )*?)\]\]>/mg;
	regex_cdata.lastIndex = 0;
	var match = regex_cdata.exec(this);
	if(match) {
		text = match[1];
	}
	var e = createTiddlyElement(document.body,"div");
	e.innerHTML = text;
	text = getPlainText(e);
	text = text.replace(/&#[\w]+?;/g,function(word) {
		var ee = createTiddlyElement(e,"div");
		ee.innerHTML = word;
		return getPlainText(ee);
	});
	removeNode(e);
	return text;
};

} //# end of 'install only once'
//}}}
