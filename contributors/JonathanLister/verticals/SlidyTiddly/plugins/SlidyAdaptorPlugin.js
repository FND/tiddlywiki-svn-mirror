/***
|''Name:''|SlidyAdaptor|
|''Description:''|Adaptor for converting Slidy files into tiddlers (http://www.w3.org/Talks/Tools/Slidy)|
|''Author''|Jon Lister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/verticals/SlidyTiddly |
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|
***/

//{{{
if(!version.extensions.SlidyAdaptor) {
version.extensions.SlidyAdaptor = {installed:true};

function SlidyAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

SlidyAdaptor.NotLoadedError = "Slidy file has not been loaded";
SlidyAdaptor.serverType = 'Slidy';

SlidyAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = SlidyAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

SlidyAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	//if(host.substr(-1) != '/')
	//	host = host + '/';
	return host;
};

SlidyAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
//#displayMessage("openHost");
	this.host = SlidyAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

SlidyAdaptor.loadSlidyCallback = function(status,context,responseText,url,xhr)
{
//#displayMessage("loadSlidyCallback:"+status);
	context.status = status;
	if(!status) {
		context.statusText = "Error reading Slidy file:" + context.host;// + xhr.statusText;
	} else {
		try {
			context.tiddlers = SlidyAdaptor.slidyToTiddlers(responseText,context.SlidyUseRawDescription);
			/*if(context.filter) {
				var tw = new TiddlyWiki();
				tw.tiddlers = tiddlers;
				tiddlers = tw.filterTiddlers(filter);
			}*/
		} catch (ex) {
			displayMessage("Error parsing Slidy:"+context.host);
		}
	}
	context.complete(context,context.userParams);
};

// Gets the list of workspaces on a given server
//# Sets context.workspaces, which contains a single default workspace, since Slidy files do not have workspaces
//# Returns true if successful, error string if not
SlidyAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
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
//# Trivial in the case of Slidy file where we don't have a workspace
SlidyAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
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
//# Sets context.tiddlers, which is an array of tiddlers. Each tiddler corresponds to an Slidy item
//# Set these variables if possible:
//# title: tiddler.title, modified: tiddler.modified, modifier: tiddler.modifier, text: tiddler.text, tags: tiddler.tags, size: tiddler.text
SlidyAdaptor.prototype.getTiddlerList = function(context,userParams,callback,filter)
{
//#displayMessage("Slidy getTiddlerList");
	context = this.setContext(context,userParams,callback);
//#displayMessage("h:"+context.host);
	if(!context.filter)
		context.filter = filter;
	context.complete = SlidyAdaptor.getTiddlerListComplete;
	if(context.tiddlers) {
		var ret = context.complete(context,context.userParams);
	} else {
		ret = loadRemoteFile(context.host,SlidyAdaptor.loadSlidyCallback,context);
		if(typeof ret != "string")
			ret = true;
	}
	return ret;
};

SlidyAdaptor.getTiddlerListComplete = function(context,userParams)
{
//#displayMessage("Slidy getTiddlerListComplete");
	context.status = true;
	if(context.callback)
		window.setTimeout(function() {context.callback(context,userParams);},10);
	return true;
};

SlidyAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	info.uri = tiddler.fields['server.host'] + "#" + tiddler.title;
	return info;
};

SlidyAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#displayMessage("getTiddler:"+title);
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.complete = SlidyAdaptor.getTiddlerComplete;
	return context.tiddlers ? 
		context.complete(context,context.userParams) :
		loadRemoteFile(context.host,SlidyAdaptor.loadSlidyCallback,context);
};

SlidyAdaptor.getTiddlerComplete = function(context,userParams)
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

SlidyAdaptor.prototype.close = function()
{
};

SlidyAdaptor.slidyToTiddlers = function(slidy,useRawDescription)
{
	var tiddlers = [];
	if(slidy) {
		slidy = slidy.replace(/\r+/mg,"");
		var regex_div = /<div([^>]*)>(.|\n)*?<\/div>/mg;
		var regex_class = new RegExp("class=['|\"]([\\w ]+)['|\"]","mg");
		var regex_meta = "<meta ((?:type|content)='[^']*'(?: *))+ \/>";
		var regex_meta_inner = new RegExp("(\\w*)='(.*?)'","mg");
		var meta_names = [
			"copyright",
			"font-size-adjustment"
		];
		var regex_slide = "";
		// convert slide div's to tiddlers
		var div_match = slidy.match(regex_div);
		var length = div_match ? div_match.length : 0;
		for(var i=0;i<length;i++) {
			var div = div_match[i];
			var inner_match = regex_class.exec(div);
			if(inner_match) {
				var classes = inner_match[1].split(" ");
				for(var j=0;j<classes.length;j++) {
					if(classes[j]=="slide") {
						var t = SlidyAdaptor.slideDivToTiddler(div);
						tiddlers.push(t);
					}
				}
			}
			regex_class.lastIndex = 0;
		}
		// convert meta tags to tiddlers
		var meta_match = slidy.match(regex_meta);
		length = meta_match ? meta_match.length : 0;
		for(i=0;i<length;i++) {
			var meta = meta_match[i];
			var matches = {};
			while(match = regex_meta_inner.exec(meta)) {
				matches[match[1]] = match[2];
			}
			if(matches.name && meta_names.contains(matches.name)) {
				var t = new Tiddler(matches.name);
				t.text = matches.content ? matches.content : "";
			}
		}
		
	}
	return tiddlers;
};

SlidyAdaptor.slideDivToTiddler = function(div) {
	var h1_regex = new RegExp("<h1>([\\S| ]*)<\/h1>","g");
	var match = h1_regex.exec(div);
	if(match) {
		var heading = match[1];
		var body = div.substring(h1_regex.lastIndex,div.indexOf("</div>"));
		var t = new Tiddler(heading);
		t.text = body;
		return t;
	} else {
		displayMessage("error converting div to tiddler - no h1: "+div);
		return false;
	}
};

config.adaptors[SlidyAdaptor.serverType] = SlidyAdaptor;

// renderHtmlText puts a string through the browser render process and then extracts the text
// useful to turn HTML entities into literals such as &apos; to '
// this method has two passes at the string - the first to convert it to html and the second
// to selectively catch the ASCII-encoded characters without losing the rest of the html
String.prototype.renderHtmlText = function() {
	//displayMessage("in renderHtmlText");
	var text = this.toString();
	var regex_cdata = /<!\[CDATA\[((?:.|\n)*?)\]\]>/mg;
	//console.log(regex_cdata.lastIndex);
	//regex_cdata.lastIndex = 0;
	//console.log(text);
	var match = regex_cdata.exec(text);
	if(match) {
		text = match[1];
		//console.log("match: ",match);
		//displayMessage("removed cdata!");
		//console.log(text);
	} else {
		//#console.log("no cdata to remove");
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
	//displayMessage("leaving renderHtmlText");
	return text;
};

} //# end of 'install only once'
//}}}
