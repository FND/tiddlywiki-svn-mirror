/***

|Title|RSSAdaptor|
|Summary|Server adaptor for talking to RSS 2.0 files|
|Description|Based on FileAdaptor|
|Version of product it works with|2.2.5|
|Version of component|1.0|
|Explanation of how it can be used and modified|This supports the server adaptor interface, a description of which can be found at: http://tiddlywiki.com/#ServerAdaptorMechanism|
|Examples where it can be seen working|The RSSAdator is used in this RSS Reader: (link to come)|
***/

//{{{

function RSSAdaptor()
{
	this.host = null;
	this.store = null;
	this.context = null;
	return this;
}

RSSAdaptor.NotLoadedError = "RSS file has not been loaded";
RSSAdaptor.serverType = 'RSS';
// Use the line below instead of the line above if you want to override the local file adaptor
// RSSAdaptor.serverType = 'file';

// Open the specified host/server
// Return true if successful, error string if not
RSSAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = host;
	if(!context)
		context = {};
	context.adaptor = this;
	context.callback = callback;
	context.userParams = userParams;
	var ret = loadRemoteFile(host,RSSAdaptor.openHostCallback,context);
	return typeof(ret) == "string" ? ret : true;
};

RSSAdaptor.openHostCallback = function(status,context,responseText,url,xhr)
{
	var adaptor = context.adaptor;
	context.status = status;
	if(!status) {
		context.statusText = "Error reading file: " + xhr.statusText;
	} else {
		// CHANGE this bit to store RSS file appropriately (as part of the adaptor?) - DONE
		// We're just storing the plain text rather than bring XML into it
		adaptor.store = responseText;
		// OLD CODE
		// Load the content into a TiddlyWiki() object
		// adaptor.store = new TiddlyWiki();
		// if(!adaptor.store.importTiddlyWiki(responseText))
		// 	context.statusText = config.messages.invalidFileError.format([url]);
	}
	context.callback(context,context.userParams);
};

// Gets the list of workspaces on a given server
// Sets context.workspaces, which is a list of workspaces
// Returns true if successful, error string if not (or it should)
// Default for RSS file as we don't have a workspace
RSSAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	if(!context)
		context = {};
	context.workspaces = [{title:"(default)"}];
	context.status = true;
	window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

// Open the specified workspace
// Returns true if successful, error string if not (or it should)
// Trivial in the case of RSS file where we don't have a workspace
RSSAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	if(!context)
		context = {};
	context.status = true;
	window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

// Gets the list of tiddlers within a given workspace
// Returns true if successful, error string if not (or it should)
// Sets context.tiddlers, which is an array of tiddlers
// Set these variables if possible:
// title: tiddler.title, modified: tiddler.modified, modifier: tiddler.modifier, text: tiddler.text, tags: tiddler.tags, size: tiddler.text
// For RSS each item is a tiddler
RSSAdaptor.prototype.getTiddlerList = function(context,userParams,callback,filter)
{
	if(!this.store)
		return RSSAdaptor.NotLoadedError;
	if(!context)
		context = {};
	context.tiddlers = [];
	// First thing to do is strip out any \r characters in the file, as TiddlyWiki doesn't deal with them
	this.store = this.store.replace(/\r+/mg,"");
	// regex_item matches on the items 
	var regex_item = /<item>(.|\n)*?<\/item>/mg;
	// regex_title matches for the titles
	var regex_title = /<title>(.|\n)*?<\/title>/mg;
	var regex_guid = /<guid>(.|\n)*?<\/guid>/mg;
	var regex_desc = /<description>(.|\n)*?<\/description>/mg;
	var regex_category = /<category>(.|\n)*?<\/category>/mg;
	var regex_link = /<link>(\S|\n)*?<\/link>/mg;
	var regex_pubDate = /<pubDate>(.|\n)*?<\/pubDate>/mg;
	var item_match = this.store.match(regex_item);
	// check for filter and then implement tag filter if of the form [tag[public stuff]]
	// filter syntax: [tag[tag1 tag2 ...]]
	// tags in the same set of brackets are all compulsory
	// TO-DO: support bracketed list, where multi-word tags are of the form [two words]
	if (filter) {
		var filter_regex = /\[(\w+)\[([ \w]+)\]\]/;
		var filter_match = filter_regex.exec(filter);
		if (filter_match) {
			// filter_match[2] is a space-seperated string of the tags to match on
			var tags_to_match = filter_match[1]=="tag" ? filter_match[2].split(" ") : null;
		} else {
			displayMessage("no match: check regex in filter");
		}
	}
	for (var i=0;i<item_match.length;i++) {
		// create a new Tiddler in context.tiddlers with the finished item object
		// grab a title
		item = {};
		var title = item_match[i].match(regex_title);
		if (title)
			item.title = title[0].replace(/^<title>|<\/title>$/mg,"");
		else {
			// something went wrong grabbing the title, grab the guid instead
			title = item_match[i].match(regex_guid);
			displayMessage("problem with getting title: " + item_match[i])
			if (title)
				item.title = title[0].replace(/^<guid>|<\/guid>$/mg,"");
			else {
				item.title = new Date();
				displayMessage("problem with getting title AND guid: " + item_match[i]);
			}
		}
		// This line makes sure any html-encoding in the title is reversed
		item.title = item.title.htmlDecode();
		// There is a problem with the title, which is that it is not formatted, so characters like &apos; are not converted at render time
		// renderHtmlText() extends String and sorts out the problem
		item.title = item.title.renderHtmlText();
		// grab a description
		desc = item_match[i].match(regex_desc);
		if (desc) item.text = desc[0].replace(/^<description>|<\/description>$/mg,"");
		else {
			item.text = "empty, something seriously wrong with this item";
			// displayMessage("description empty for item: " + item.title);
		}
		var t = new Tiddler(item.title);
		t.text = "<html>" + item.text.htmlDecode().renderHtmlText() + "</html>";
		// grab the categories
		category = item_match[i].match(regex_category);
		if (category) {
			item.categories = [];
			for (var j=0;j<category.length;j++) {
				item.categories[j] = category[j].replace(/^<category>|<\/category>$/mg,"");
			}
			t.tags = item.categories;
		} else {
			// displayMessage("no tags for item: " + item.title);
		}
		// grab the link and put it in a custom field (assumes this is sensible)
		// regex_link assumes you can never have whitespace in a link
		link = item_match[i].match(regex_link);
		if (link) item.link = link[0].replace(/^<link>|<\/link>$/mg,"");
		else {
			item.link = "#";
			// displayMessage("link empty for item: " + item.title);
		}
		t.fields["link to original"] = item.link;
		// grab date created
		pubDate = item_match[i].match(regex_pubDate);
		if (pubDate) {
			pubDate = pubDate[0].replace(/^<pubDate>|<\/pubDate>$/mg,"");
			// TO-DO: does this work on Windows FF and IE??
			item.pubDate = new Date(pubDate);
		} else {
			item.pubDate = new Date();
			// displayMessage("pubDate empty for item: " + item.title);
		}
		t.created = item.pubDate;
		// check to see that we have a filter to use
		if (filter_match) {
			if(t.isTaggedAllOf(tags_to_match)) {
				context.tiddlers.push(t);
			}
		} else {
			// with no filter, we just add all the tiddlers
			context.tiddlers.push(t);
		}
	}
	context.status = true;
	// Set this.context so that we can refer to the tiddler list even if it is not passed on to us
	this.context = context;
	window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

// QUERY: what actually calls this and does it always pass in a real tiddler?
RSSAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	info.uri = tiddler.fields['server.host'] + "#" + tiddler.title;
	return info;
};

// Retrieves a tiddler from a given workspace on a given server
// Sets context.tiddler to the requested tiddler
// Context object passed in from importTiddlers is empty so we use this.context
// Returns true if successful, error string if not (or it should)
RSSAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	if(!this.store)
		return RSSAdaptor.NotLoadedError;
	if(!context)
		context = {};
	// Retrieve the tiddler from the this.context.tiddlers array
	for (var i=0; i<this.context.tiddlers.length; i++) {
		if (this.context.tiddlers[i].title == title) {
			context.tiddler = this.context.tiddlers[i];
		}
	}
	// NOTE: this doesn't add the filter field - is that ok? Probably not...
	if(context.tiddler) {
		context.tiddler.fields['server.type'] = RSSAdaptor.serverType;
		context.tiddler.fields['server.host'] = this.host;
		context.tiddler.fields['server.page.revision'] = context.tiddler.modified.convertToYYYYMMDDHHMM();
		context.status = true;
	} else {
		context.status = false;
		context.statusText = "error retrieving tiddler: " + title;
		return context.statusText;
	}
	if(context.allowSynchronous) {
		context.isSynchronous = true;
		callback(context,userParams);
	} else {
		window.setTimeout(function() {callback(context,userParams);},10);
	}
	return true;
};

RSSAdaptor.prototype.close = function()
{
	delete this.store;
	this.store = null;
};

config.adaptors[RSSAdaptor.serverType] = RSSAdaptor;

// Hack to override the importTiddlers local file behaviour
config.macros.importTiddlers.onBrowseChange = function(e)
{
	var wizard = new Wizard(this);
	var fileInput = wizard.getElement("txtPath");
	fileInput.value = "file://" + this.value;
	var serverType = wizard.getElement("selTypes");
	if(serverType.value != "RSS") {
		serverType.value = "file";
	}
	return false;
};

// renderHtmlText puts a string through the browser render process and then extracts the text
// useful to turn HTML entities into literals such as &apos; to '
String.prototype.renderHtmlText = function() {
	var e = createTiddlyElement(document.body,"div");
	e.innerHTML = this;
	var text = getPlainText(e);
	removeNode(e);
	return text;
};

// Test if a tiddler carries any of an array of tags
// Takes an array of tags
// Returns true if there is a match, false if not
Tiddler.prototype.isTaggedAnyOf = function(tag_array)
{
	if (tag_array) {
		// get a string of this tiddler's tags
		var this_tag_list = this.getTags();
		// spilt that into an array
		var this_tag_array = this_tag_list.split(" ");
		// check that all the members of tag_array are contained in this_tag_array
		for (var i=0; i<this_tag_array.length; i++) {
			for (var j=0; j<tag_array.length; j++) {
				if (this_tag_array[i] == tag_array[j]) {
					return true;
				}
			}
		}
		// if we get to this point, we've not had any matches
		return false;
	} else {
		return false;
	}
};

// Test if a tiddler carries all of an array of tags
// Takes an array of tags
// Returns true if all match, false if not
Tiddler.prototype.isTaggedAllOf = function(tag_array)
{
	if (tag_array) {
		// get a string of this tiddler's tags
		var this_tag_list = this.getTags();
		// spilt that into an array
		var this_tag_array = this_tag_list.split(" ");
		// check whether any of the members of tag_array are not contained in this_tag_array
		for (var i=0; i<tag_array.length; i++) {
			// tag_match is a flag to signal whether we've had a match for a compulsory tag
			var tag_match = false;
			for (var j=0; j<this_tag_array.length; j++) {
				if (tag_array[i] == this_tag_array[j]) {
					tag_match = true;
					break;
				}
			}
			// if tag_match is still false after we've looked through the tiddler's tags,
			// there is a failed match in the compulsory list so we can return false
			if (tag_match == false) {
				return false;
			}
		}
		// now we've looked through the compulsory tags, return true
		// this is valid because we would have returned false by this point anyway if
		// there had been no match
		return true;
	} else {
		return false;
	}
};

//}}}