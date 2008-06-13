/***
|''Name:''|SharedNotesAdaptor|
|''Description:''|Adaptor to parse SharedNotes RSS 2.0 feeds|
|''Author''|Paul Downey|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/adaptors/SharedNotesAdaptor.js |
|''Version:''|0.1.7|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|


***/

//{{{
if(!version.extensions.SharedNotesAdaptor) {
version.extensions.SharedNotesAdaptor = {installed:true};

function SharedNotesAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

SharedNotesAdaptor.NotLoadedError = "RSS file has not been loaded";
SharedNotesAdaptor.serverType = 'sharednotes';

/*
 *  parse SharedNotes RSS 2.0 feed
 */
SharedNotesAdaptor.rssToTiddlers = function(rss,useRawDescription)
{
	var tiddlers = [];
	rss = rss.replace(/\r+/mg,"");

	var regex_item = /<item>(.|\n)*?<\/item>/mg;
	var regex_title = /<title>(.|\n)*?<\/title>/mg;
	var regex_guid = /<guid>(.|\n)*?<\/guid>/mg;
	var regex_desc = /<description>(.|\n)*?<\/description>/mg;
	var regex_wiki = /<wikitext>(.|\n)*?<\/wikitext>/mg;
	var regex_content = /<content:encoded>(.|\n)*?<\/content:encoded>/mg;
	var regex_category = /<category>(.|\n)*?<\/category>/mg;
	var regex_link = /<link>(\S|\n)*?<\/link>/mg;
	var regex_pubDate = /<pubDate>(.|\n)*?<\/pubDate>/mg;
	var regex_author = /<author>(.|\n)*?<\/author>/mg;
	var regex_source = /<source([^>]*)>([^<]*)<\/source>/m;
	var item_match = rss.match(regex_item);
	var length = item_match ? item_match.length : 0;

	for(var i=0;i<length;i++) {
		var item = {};
		var title = item_match[i].match(regex_title);
		if(title) {
			item.title = title[0].replace(/^<title>|<\/title>$/mg,"");
		} else {
			title = item_match[i].match(regex_guid);

		}

		item.title = item.title.htmlDecode();

		var t = new Tiddler(item.title);

		var wikitext = item_match[i].match(regex_wiki);
		if(wikitext) {
			item.text = wikitext[0].replace(/^<wikitext>|<\/wikitext>$/mg,"");
			useRawDescription = true;
		} else {
			// use the description as the tiddler text
			var desc = item_match[i].match(regex_desc);
			if(desc) {
				item.text = desc[0].replace(/^<description>|<\/description>$/mg,"");
			}
			if(item.text == "") {
				var content = item_match[i].match(regex_content);
				if(content) {
					item.text = content[0].replace(/^<content:encoded>|<\/content:encoded>$/mg,"");
				}
			}
		}
		// now decode and process the text if it exists
		if(item.text) {
			item.text = item.text.htmlDecode();
			item.text = useRawDescription ? item.text : "<html>" + item.text.renderHtmlText() + "</html>";
		} else {
			item.text = "";
		}
		t.text = item.text;

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
		
		// grab source url and name
		source = item_match[i].match(regex_source);
		if (source) {
			source_url = source[1].replace(/ url="|"$/mg,"");
			source_name = source[2];
			t.fields.source_url = source_url;
			t.fields.source_name = source_name;
		} else {
			// No source field is ok
		}
		
		tiddlers.push(t);
	}
	return tiddlers;
};


SharedNotesAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = SharedNotesAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

SharedNotesAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	return host;
};

SharedNotesAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = SharedNotesAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

SharedNotesAdaptor.loadRssCallback = function(status,context,responseText,url,xhr)
{
	context.status = status;
	if(!status) {
		context.statusText = "Error reading RSS file:" + context.host;
	} else {
		try {
			context.tiddlers = SharedNotesAdaptor.rssToTiddlers(responseText,context.rssUseRawDescription);
		} catch (ex) {
			displayMessage("Error parsing RSS:"+context.host);
		}
	}
	context.complete(context,context.userParams);
};

SharedNotesAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.workspaces = [{title:"(default)"}];
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

SharedNotesAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

SharedNotesAdaptor.prototype.getTiddlerList = function(context,userParams,callback,filter)
{
	context = this.setContext(context,userParams,callback);
	if(!context.filter)
		context.filter = filter;
	context.complete = SharedNotesAdaptor.getTiddlerListComplete;
	if(context.tiddlers) {
		var ret = context.complete(context,context.userParams);
	} else {
		ret = loadRemoteFile(context.host,SharedNotesAdaptor.loadRssCallback,context);
		if(typeof ret != "string")
			ret = true;
	}
	return ret;
};

SharedNotesAdaptor.getTiddlerListComplete = function(context,userParams)
{
	context.status = true;
	if(context.callback)
		window.setTimeout(function() {context.callback(context,userParams);},10);
	return true;
};

SharedNotesAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	info.uri = tiddler.fields['server.host'] + "#" + tiddler.title;
	return info;
};

SharedNotesAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.complete = SharedNotesAdaptor.getTiddlerComplete;
	return context.tiddlers ? 
		context.complete(context,context.userParams) :
		loadRemoteFile(context.host,SharedNotesAdaptor.loadRssCallback,context);
};

SharedNotesAdaptor.getTiddlerComplete = function(context,userParams)
{
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

SharedNotesAdaptor.prototype.close = function()
{
};

config.adaptors[SharedNotesAdaptor.serverType] = SharedNotesAdaptor;

} //# end of 'install only once'
//}}}
